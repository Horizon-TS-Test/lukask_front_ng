import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Comment } from '../../models/comment';
import { DomSanitizer } from '@angular/platform-browser';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { ActionService } from '../../services/action.service';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';

@Component({
  selector: 'comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit, OnDestroy, OnChanges {
  @Input() commentModel: Comment;
  @Input() focusCommentId: string;
  @Input() focusReplyId: string;
  @Input() isReply: boolean;
  @Input() noReplyBtn: boolean;
  @Input() hideBtn: boolean;

  private subscription: Subscription;
  private alertData: Alert;

  public userProfile: User;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _notifierService: NotifierService,
    private _actionService: ActionService,
    private _userService: UserService
  ) {
    this.subscription = this._userService._userUpdate.subscribe((update: boolean) => {
      if (update) {
        this.setOwnUserProfile();
      }
    });
  }

  ngOnInit() {
    if (this.focusReplyId !== undefined && this.focusCommentId == this.commentModel.commentId) {
      setTimeout(() => {
        this.viewReplies();
      }, 500);
    }
  }

  /**
   * MÉTODO PARA MOSTRAR UN ALERTA EN EL DOM:
   */
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL OBJETO USUARIO DE LOS COMENTARIOS DEL 
   * USUARIOS LOGEADOAL MOMENTO DE ACTUALIZAR EL PERFIL DE USUARIO:
   */
  private setOwnUserProfile() {
    this.userProfile = this._userService.getUserProfile();
    if (this.commentModel.user.id == this.userProfile.id) {
      this.commentModel.user = this.userProfile;
    }
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA MOSTRAR LAS RESPUESTAS DE UN COMENTARIO:
   * @param event 
   */
  public viewReplies(event: any = null) {
    if (event) {
      event.preventDefault();
    }
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_replies, contentData: { parentComment: this.commentModel, replyId: this.focusReplyId } });
  }

  /**
   * MÉTODO PARA ABRIR EL POP OVER DE LA LISTA DE APOYOS:
   * @param event 
   */
  public openSupportList(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.support_list, contentData: { commentId: this.commentModel.commentId, commentOwner: this.commentModel.user.person.name } });
  }

  /**
   * MÉTODO PARA DAR RELEVANCIA A UNA PUBLICACIÓN Y ENVIARLA AL BACKEND:
   * @param event 
   */
  public onRelevance(event: any) {
    event.preventDefault();
    this._actionService.saveRelevance(this.commentModel.publicationId, this.commentModel.commentId, !this.commentModel.userRelevance)
      .then((response: any) => {
        if (response == 'backSyncOk') {
          this.alertData = new Alert({ title: 'Proceso Pendiente', message: 'Tu apoyo se enviará en la próxima conexión', type: ALERT_TYPES.info });
          this.setAlert();
        }
        else {
          this.commentModel.userRelevance = response;
        }
      })
      .catch((error) => {
        this.alertData = new Alert({ title: 'Proceso Fallido', message: 'No se ha podido procesar la petición', type: ALERT_TYPES.danger });
        this.setAlert();
      });
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      /*console.log('Previous:', changes[property].previousValue);
      console.log('Current:', changes[property].currentValue);
      console.log('firstChange:', changes[property].firstChange);*/

      if (property === 'hideBtn') {
        if (changes[property].currentValue) {
          this.hideBtn = changes[property].currentValue;
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
