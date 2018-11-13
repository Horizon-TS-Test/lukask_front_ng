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
import { ArrayManager } from 'src/app/tools/array-manager';
import { CommentFormService } from 'src/app/services/comment-form.service';
import { SocketService } from 'src/app/services/socket.service';
import { ActionFeederService } from 'src/app/services/action-feeder.service';
import { Media } from '../../models/media';
import * as lodash from 'lodash';

declare var deleteItemData: any;

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
  private commentSubs: Subscription;
  private newComSubscriptor: Subscription;
  private delOffComSubscriptor: Subscription;
  private commentList: Comment[];
  private mainComments: any;
  
  public mediosImg : Media[];
  public userProfile: User;
  public firstPattern: string;
  public pagePattern: string;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _dynaContentService: DynaContentService,
    private _userService: UserService,
    private _actionService: ActionService,
    private _actionFeederService: ActionFeederService,
    private _commentFormService: CommentFormService,
    private _socketService: SocketService
  ) {

    this.commentList = [];
  }

  ngOnInit() {
    this.getMedioImgPub();
    this.defineMainComments();
    this.getComments();
    this.listenToProfileUp()
    this.listenToSocket();
    this.onCommentResponse();
    this.listenToDelOffCom();
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACTUALIZACIÓN DEL PERFIL DE USUARIO:
   */
  private listenToProfileUp() {
    this.subscription = this._userService.updateUser$.subscribe((update: boolean) => {
      if (update) {
        this.setOwnUserProfile();
      }
    });
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
      this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.view_queja, contentData: this.queja.id_publication });
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

  /**************************************************************************************************************************************/
  /*********************************************MÉTODOS PARA ADMINISTRAR LA LISTA DE COMENTARIO******************************************/
  /**************************************************************************************************************************************/

  /**
   * MÉTODO PARA INICIALIZAR LOS DATOS DEL ARRAY SECUNDARIO DE COMENTARIOS:
   */
  private defineMainComments() {
    this.mainComments = [];
  }

  /**
   * MÉTODO PARA CARGAR LOS COMENTARIOS DESDE EL BACKEND:
   */
  private getComments() {
    this._actionFeederService.getComments(this.queja.id_publication)
      .then((commentData: any) => {
        this.defineMainComments();
        this.firstPattern = commentData.pagePattern;
        this.pagePattern = commentData.pagePattern;
        this.commentList = commentData.comments;
        this._actionService.loadComments(commentData);
      });
  }

  /**
   * MÉTODO PARA ESCUCHAR EL EVENTO PARA SOLICITAR MAS COMENTARIOS:
   * @param event 
   */
  public askForMore(event: boolean) {
    this._actionFeederService.askForMore(this.queja.id_publication, this.pagePattern, this.commentList, event)
      .then((commentData: any) => {
        this.pagePattern = commentData.pagePattern;
        this.commentList = commentData.comments;
        this._actionService.loadComments(commentData);
      });
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL PATTERN QUE VIENE DEL BACKEND PARA NO COMPROMETER LA SECUENCIA 
   * DE REGISTRO A TRAER DEL BACKEND BAJO DEMANDA, CUANDO SE REGISTRE UN NUEVO COMENTARIO:
   */
  private updatePattern() {
    if (this.pagePattern) {
      let offsetPos = this.pagePattern.indexOf("=", this.pagePattern.indexOf("offset")) + 1;
      let newOffset = parseInt(this.pagePattern.substring(offsetPos)) + 1;
      this.pagePattern = this.pagePattern.substring(0, offsetPos) + newOffset;
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS EMISIONES DEL OBJETO EVENT-EMITER DEL COMPONENTE HIJO,
   * EL NUEVO COMENTARIO QUE DEVUELVE EL COMPONENTE HIJO, PROVENIENTE DEL BACKEND:
   */
  private onCommentResponse() {
    this.newComSubscriptor = this._commentFormService.newComment$.subscribe((newCom: Comment) => {
      if (newCom && this.commentList) {
        if (newCom.publicationId == this.queja.id_publication && !newCom.commentParentId) {
          if (newCom.isOffline) {
            this.commentList.splice(0, 0, newCom);
          }
          else {
            let lastComment: Comment;
            //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
            lastComment = this.commentList.find(com => com.commentId === newCom.commentId);

            if (ArrayManager.backendServerSays("CREATE", this.commentList, lastComment, newCom) == true) {
              this.updatePattern();
            }
          }

          this._actionService.loadComments({ comments: this.commentList, pagePattern: this.pagePattern });
        }
      }
    });
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL NUMERO DE RELEVANCIAS DE UN COMENTARIO:
   */
  public updateRelevanceCounter(actionData) {
    if (actionData.action_parent) {
      let currentComment = this.commentList.find(com => com.commentId == actionData.action_parent);

      if (currentComment) {
        this._actionService.getCommentById(actionData.action_parent).then((newCom: Comment) => {
          ArrayManager.backendServerSays("UPDATE", this.commentList, currentComment, newCom);
          this._actionFeederService.updateRelNumberIndexDb(actionData.id_action, newCom.relevance_counter, actionData.user_register.id);

          this._actionService.loadComments({ comments: this.commentList, pagePattern: this.pagePattern });
        });
      }
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS ACTUALIZACIONES DEL CLIENTE SOCKET.IO
   * QUE TRAE CAMBIOS DESDE EL BACKEND (CREATE/UPDATE/DELETE)
   * Y ACTUALIZAR LA LISTA GLOBAL DE COMENTARIOS CON LOS NUEVOS CAMBIOS
   */
  private listenToSocket() {
    this.commentSubs = this._socketService.commUpdate$.subscribe((socketCom: any) => {
      if (socketCom && this.commentList) {
        let action = socketCom.payload.action.toUpperCase();

        if (socketCom.payload.data.description != null) {
          this._actionFeederService.updateCommentList(this.queja.id_publication, socketCom.payload.data, action, this.pagePattern, this.commentList, this.mainComments);
          this._actionFeederService.deleteOffComAsoc(this._actionService.extractCommentJson(socketCom.payload.data), this.commentList);
          this._actionService.loadComments({ comments: this.commentList, pagePattern: this.pagePattern });
        }
        else {
          this.updateRelevanceCounter(socketCom.payload.data);
        }
      }
    });
  }

  /**
   * MÉTODO PARA CANCELAR UN COMENTARIO OFFLINE
   * @param comment 
   */
  public onCancelComment(comment: Comment) {
    this.commentList.splice(this.commentList.indexOf(comment), 1);
    this._actionService.loadComments({ comments: this.commentList, pagePattern: this.pagePattern });

    deleteItemData("sync-comment", comment.commentId);
  }

  /**
   * MÉTODO PARA NOTIFICAR AL PADRE DE ESTE COMPONENTE QUE UN COMENTARIO HA SIDO APOYADO EN MODO OFFLINE, 
   * PARA CAMBIAR LA APARIENCIA DEL DOM:
   */
  public changeComOffRelevance(comment: Comment) {
    this._actionService.changeComOffRelevance(comment, this.commentList, this.pagePattern);
  }

  /**
   * MÉTODO PARA ESCUCHAR CUANDO UN COMENTARIO OFFLINE HA SIDO ELIMINADO:
   */
  public listenToDelOffCom() {
    this.delOffComSubscriptor = this._commentFormService.delOffCommentId$.subscribe((delCommentId: string) => {
      if (delCommentId) {
        let deletedComment = this.commentList.find(com => com.commentId == delCommentId);
        this.commentList.splice(this.commentList.indexOf(deletedComment), 1);

        this._actionService.loadComments({ comments: this.commentList, pagePattern: this.pagePattern });
      }
    });
  }

  ngOnDestroy() {
    this._dynaContentService.loadDynaContent(null);
    this._actionService.loadComments(null);

    this.subscription.unsubscribe();
    this.newComSubscriptor.unsubscribe();
    this.commentSubs.unsubscribe();
    this.delOffComSubscriptor.unsubscribe();
  }

  /**
   * METODO PARA OBTENER EL ARRAY DE MEDIOS DE TIPO IMAGEN
   */
  private getMedioImgPub(){
    this.mediosImg = lodash.filter(this.queja.media, function(obj){
      return obj.format =='IG';
    });
  }
}
