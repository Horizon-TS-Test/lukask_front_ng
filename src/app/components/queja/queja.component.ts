import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Publication } from '../../models/publications';
import { CONTENT_TYPES } from '../../config/content-type';
import { ActionService } from '../../services/action.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Subscription } from 'rxjs';
import { ACTION_TYPES } from '../../config/action-types';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { Comment } from 'src/app/models/comment';

@Component({
  selector: 'app-queja',
  templateUrl: './queja.component.html',
  styleUrls: ['./queja.component.css'],
  providers: [ActionService]
})
export class QuejaComponent implements OnInit, OnDestroy {
  @Input() queja: Publication;
  @Output() actionType = new EventEmitter<number>();
  @Output() onCancelPub = new EventEmitter<Publication>();

  private subscription: Subscription;
  private commentList: Comment[];

  public userProfile: User;
  public firstPattern: string;
  public pagePattern: string;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _DynaContentService: DynaContentService,
    private _userService: UserService,
    private _actionService: ActionService,
  ) {
    this.subscription = this._userService._userUpdate.subscribe((update: boolean) => {
      if (update) {
        this.setOwnUserProfile();
      }
    });

    this.commentList = [];
  }

  ngOnInit() {
    this.getComments();
  }

  /**
   * MÉTODO QUE ESCUCHA LA ACTUALIZACIÓN DE LOS DATOS DE PERFIL DEL USUARIO LOGEADO 
   * PARA ACTUALIZAR LA INFORMACIÓN DE LAS PUBLICACIONES QUE PERTENECEN AL MISMO PERFIL:
   */
  private setOwnUserProfile() {
    this.userProfile = this._userService.getUserProfile();
    if (this.queja.user.id == this.userProfile.id) {
      this.queja.user = this.userProfile;
    }
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA VER EL DETALLE DE UNA QUEJA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public viewQuejaDetail(event: any) {
    event.preventDefault();
    if (!this.queja.isOffline) {
      this._DynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.view_queja, contentData: this.queja.id_publication });
    }
  }

  /**
   * MÉTODO PARA CAPTAR LA ACCIÓN DE ALGÚN BOTÓN DEL LA LSITA DE BOTONES, COMPONENTE HIJO
   * @param $event VALOR DEL TIPO DE ACCIÓN QUE VIENE EN UN EVENT-EMITTER
   */
  public optionButtonAction(event: number) {
    if (event === ACTION_TYPES.mapFocus) {
      this.actionType.emit(event);
    }
  }

  /**
   * MÉTODO PARA CANCELAR EL ENVÍO DE LA PUBLICACIÓN OFFLINE:
   * @param event
   */
  public cancelPub(event: any) {
    event.preventDefault();
    this.onCancelPub.emit(this.queja);
  }

  /**
   * MÉTODO PARA CARGAR LOS COMENTARIOS DESDE EL BACKEND:
   */
  private getComments() {
    this._actionService.getCommentByPub(this.queja.id_publication, false)
      .then((commentsData: any) => {
        /*this.defineMainComments();
        this.getOfflineComRelevances(this.commentList);
        this.getOfflineComments();*/

        this.firstPattern = commentsData.pagePattern;
        this.pagePattern = commentsData.pagePattern;
        this.commentList = commentsData.comments;
        this._actionService.loadComments(commentsData);
      });
  }

  /**
   * MÉTODO PARA CARGAR MAS COMENTARIOS BAJO PETICIÓN
   */
  public getMoreComments() {
    this._actionService.getMoreCommentByPub(this.queja.id_publication, false, this.pagePattern)
      .then((commentsData: any) => {
        //this.getOfflineComRelevances(commentsData.comments);
        this.pagePattern = commentsData.pagePattern;
        this.commentList = this.commentList.concat(commentsData.comments);
        this._actionService.loadComments({ comments: this.commentList, pagePattern: this.pagePattern });
      });
  }

  /**
   * MÉTODO PARA ESCUCHAR EL EVENTO PARA SOLICITAR MAS COMENTARIOS:
   * @param event 
   */
  public askForMore(event: boolean) {
    if (event) {
      this.getMoreComments();
    }
    else {
      this.pagePattern = this.firstPattern;
      this.commentList.splice(this._actionService.pageLimit, this.commentList.length - this._actionService.pageLimit);
      this._actionService.loadComments({ comments: this.commentList, pagePattern: this.pagePattern });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
