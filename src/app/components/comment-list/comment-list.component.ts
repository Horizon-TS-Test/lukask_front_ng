import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ActionService } from '../../services/action.service';
import { Comment } from '../../models/comment';
import { ArrayManager } from '../../tools/array-manager';
import { SocketService } from '../../services/socket.service';
import { REST_SERV } from '../../rest-url/rest-servers';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

declare var writeData: any;

@Component({
  selector: 'comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit {
  @Input() pubId: string;
  @Input() isModal: boolean;
  @Output() closeModal = new EventEmitter<boolean>();

  private _CLOSE = 1;

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  public firstPattern: string;
  public pagePattern: string;

  public newComment: Comment;
  public commentList: Comment[];
  public activeClass: string;
  public matButtons: HorizonButton[];

  constructor(
    private _actionService: ActionService,
    private _socketService: SocketService
  ) {
    this.activeClass = this.LOADER_HIDE;
    this.matButtons = [
      {
        parentContentType: 1,
        action: this._CLOSE,
        icon: "close"
      }
    ];

    this.listenToSocket();
  }

  ngOnInit() {
    this.resetComment();
    this.getComments();
  }

  /**
   * MÉTODO PARA INICIALIZAR EL OBJETO DE TIPO COMMENT PARA REGISTRAR UN NUEVO COMENTARIO:
   */
  resetComment() {
    this.newComment = new Comment("", "", this.pubId);
  }

  /**
   * MÉTODO PARA CARGAR LOS COMENTARIOS DESDE EL BACKEND:
   */
  getComments() {
    if(this.isModal == true) {
      this._actionService.pageLimit = this._actionService.MOBILE_LIMIT;
    }
    this._actionService.getCommentByPub(this.pubId, false)
      .then((commentsData: any) => {
        this.commentList = commentsData.comments;
        this.firstPattern = commentsData.pagePattern;
        this.pagePattern = commentsData.pagePattern;
      });
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS EMISIONES DEL OBJETO EVENT-EMITER DEL COMPONENTE HIJO
   * @param event EL NUEVO COMENTARIO QUE DEVUELVE EL COMPONENTE HIJO, PROVENIENTE DEL BACKEND
   */
  onCommentResponse(event: Comment) {
    let lastComment: Comment;
    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    lastComment = this.commentList.find(com => com.commentId === event.commentId);

    ArrayManager.backendServerSays("CREATE", this.commentList, lastComment, event);
  }

  /**
   * MÉTODO PARA CARGAR MAS COMENTARIOS
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  askForMore(event: any) {
    event.preventDefault();
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      if (this.pagePattern) {
        this._actionService.getMoreCommentByPub(this.pubId, false, this.pagePattern)
          .then((commentsData: any) => {
            setTimeout(() => {
              this.activeClass = "";

              setTimeout(() => {
                this.activeClass = this.LOADER_HIDE;
                this.commentList = this.commentList.concat(commentsData.comments);
                this.pagePattern = commentsData.pagePattern;
              }, 800);

            }, 1000)
          })
          .catch(err => {
            console.log(err);

            setTimeout(() => {
              this.activeClass = "";

              setTimeout(() => {
                this.activeClass = this.LOADER_HIDE;
              }, 800);
            }, 1000)
          });
      }
      else {
        setTimeout(() => {
          this.activeClass = "";

          setTimeout(() => {
            this.pagePattern = this.firstPattern;
            this.activeClass = this.LOADER_HIDE;
            this.commentList.splice(this._actionService.pageLimit, this.commentList.length - this._actionService.pageLimit);
          }, 800);
        }, 1000)
      }
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS ACTUALIZACIONES DEL CLIENTE SOCKET.IO
   * QUE TRAE CAMBIOS DESDE EL BACKEND (CREATE/UPDATE/DELETE)
   * Y ACTUALIZAR LA LISTA GLOBAL DE COMENTARIOS CON LOS NUEVOS CAMBIOS
   */
  listenToSocket() {
    this._socketService._commentUpdate.subscribe(
      (socketPub: any) => {
        let action = socketPub.payload.action.toUpperCase();

        this.updateCommentList(socketPub.payload.data, action);
      }
    );
  }

  /**
   * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE PUBLICACIONES
   * @param pubJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
   * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
   */
  updateCommentList(commentJson: any, action: string) {
    console.log(commentJson.publication);
    if (commentJson.description != null && commentJson.publication == this.pubId) {
      let lastComment: Comment, newCom: Comment;

      //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
      commentJson.media_profile = ((commentJson.user_register.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + commentJson.user_register.media_profile;
      ////

      //STORING THE NEW DATA COMMING FROM SOMEWHERE IN INDEXED-DB:
      /*if ('indexedDB' in window) {
        writeData('comment', commentJson);
      }*/
      ////

      //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
      lastComment = this.commentList.find(com => com.commentId === commentJson.id_action);

      if (action != ArrayManager.DELETE) {
        newCom = this._actionService.extractCommentJson(commentJson);
      }

      ArrayManager.backendServerSays(action, this.commentList, lastComment, newCom);
    }
  }
}
