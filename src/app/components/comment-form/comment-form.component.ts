import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionService } from '../../services/action.service';
import { PatternManager } from '../../tools/pattern-manager';
import { Comment } from '../../models/comment';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { DateManager } from '../../tools/date-manager';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import * as Snackbar from 'node-snackbar';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { CONTENT_TYPES } from 'src/app/config/content-type';
import { CommentFormService } from 'src/app/services/comment-form.service';

@Component({
  selector: 'comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css']
})
export class CommentFormComponent implements OnInit, OnDestroy {
  @Input() commentModel: Comment;
  @Output() closeModal = new EventEmitter<boolean>();

  public maxChars: number;
  public restChars: number;
  public subscription: Subscription;
  public commentSent: boolean;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _actionService: ActionService,
    private _userService: UserService,
    private _dynaContentService: DynaContentService,
    private _commentFormService: CommentFormService,
    private _ngZone: NgZone
  ) {
    this.maxChars = 200;
    this.restChars = this.maxChars;
    this.commentSent = false;

    this.subscription = this._userService._userUpdate.subscribe((update: boolean) => {
      if (update) {
        this.setUser();
      }
    });
  }

  ngOnInit() {
    this.commentModel.commentId = new Date().toISOString();;
    this.commentModel.active = true;
    this.commentModel.dateRegister = DateManager.getFormattedDate();
    this.setUser();
  }

  /**
   * MÉTODO PARA ASIGNAR UN VALOR AL PERFIL DE USUARIO A MOSTRAR EN EL FORMULARIO DE COMENTARIO:
   */
  private setUser() {
    this.commentModel.user = this._userService.getUserProfile();
  }

  /**
   * MÉTODO PARA CONTROLAR EL LÍMITE MÁXIMO DE CARACTERES A INGRESAR 
   * EN UN COMENTARIO O RESPUESTA, FUERA DEL CONTEXTO DE ANGULAR
   * @param event EVENTO DE KEYPRESS
   */
  public validateLettersNumber(event: KeyboardEvent) {
    //REF: https://github.com/angular/angular/issues/20970
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.restChars = PatternManager.limitWords(this.maxChars, this.commentModel.description.length);
        console.log("[COMMENT FORM]: Running outside the angular context");
      });
    });
  }

  /**
   * MÉTODO PARA RESETEAR EL CAMPO DE TEXTO DEL TEMPLATE DRIVEN FORM:
   */
  private resetComment() {
    this.commentModel.description = "";
  }

  /**
   * MÉTODO PARA ENVIAR UN COMENTARIO AL BACKEND:
   */
  public publishComment() {
    this.commentSent = true;

    this._actionService.saveComment(this.commentModel)
      .then((response) => {
        this.commentSent = false;

        if (response == true) {
          Snackbar.show({ text: 'Tu ' + (this.commentModel.commentParentId ? 'respuesta' : 'comentario') + ' se enviará en la próxima conexión', pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });

          let offComment = new Comment(this.commentModel.commentId, this.commentModel.description, this.commentModel.publicationId, this._userService.getUserProfile(), this.commentModel.commentParentId, this.commentModel.active, this.commentModel.dateRegister, null, null, true);
          this._commentFormService.newCommentInserted(offComment);
        }
        else {
          this._commentFormService.newCommentInserted(this._actionService.extractCommentJson(response));
        }

        this.resetComment();
        this.validateLettersNumber(null);

        this.closeModal.emit(true);
      })
      .catch(err => {
        console.log(err);
        this.commentSent = false;
        let alertData = new Alert({ title: 'Proceso Fallido', message: 'No se pudo procesar la petición', type: ALERT_TYPES.danger });
        this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.alert, contentData: alertData });
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
