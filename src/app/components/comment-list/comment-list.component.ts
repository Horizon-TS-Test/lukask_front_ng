import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ActionService } from '../../services/action.service';
import { Comment } from '../../models/comment';
import { ArrayManager } from '../../tools/array-manager';
import { SocketService } from '../../services/socket.service';
import { REST_SERV } from '../../rest-url/rest-servers';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { NotifierService } from '../../services/notifier.service';
import { Subscription } from 'rxjs';

declare var upgradeTableFieldDataArray: any;

@Component({
  selector: 'comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() pubId: string;
  @Input() commentId: string;
  @Input() replyId: string;
  @Input() isModal: boolean;
  @Output() closeModal = new EventEmitter<boolean>();

  private _CLOSE = 1;

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private subscriptor: Subscription;
  private mainComments: any;

  public firstPattern: string;
  public pagePattern: string;

  public newComment: Comment;
  public commentList: Comment[];
  public activeClass: string;
  public matButtons: HorizonButton[];

  constructor(
    private _actionService: ActionService,
    private _socketService: SocketService,
    private _notifierService: NotifierService
  ) {
    this.activeClass = this.LOADER_HIDE;
    this.matButtons = [
      {
        parentContentType: 1,
        action: this._CLOSE,
        icon: "close"
      }
    ];

    this.defineMainComments();
    this.listenToSocket();
  }

  ngOnInit() {
    this.resetComment();
    this.getComments();
    this.onCommentResponse();
  }

  /**
   * MÉTODO PARA INICIALIZAR LOS DATOS DEL ARRAY SECUNDARIO DE COMENTARIOS:
   */
  defineMainComments() {
    this.mainComments = [];
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
    if (this.isModal == true) {
      this._actionService.pageLimit = this._actionService.MOBILE_LIMIT;
    }
    this._actionService.getCommentByPub(this.pubId, false)
      .then((commentsData: any) => {
        this.defineMainComments();
        this.commentList = commentsData.comments;
        this.firstPattern = commentsData.pagePattern;
        this.pagePattern = commentsData.pagePattern;
      });
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS EMISIONES DEL OBJETO EVENT-EMITER DEL COMPONENTE HIJO,
   * EL NUEVO COMENTARIO QUE DEVUELVE EL COMPONENTE HIJO, PROVENIENTE DEL BACKEND:
   */
  onCommentResponse() {
    this.subscriptor = this._notifierService._newCommentResp.subscribe((newCom: Comment) => {
      if (newCom.publicationId == this.pubId && !newCom.commentParentId) {
        let lastComment: Comment;
        //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
        lastComment = this.commentList.find(com => com.commentId === newCom.commentId);

        if (ArrayManager.backendServerSays("CREATE", this.commentList, lastComment, newCom) == true) {
          this.updatePattern();
        }
      }
    });
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL PATTERN QUE VIENE DEL BACKEND PARA NO COMPROMETER LA SECUENCIA 
   * DE REGISTRO A TRAER DEL BACKEND BAJO DEMANDA, CUANDO SE REGISTRE UN NUEVO COMENTARIO:
   */
  updatePattern() {
    if (this.pagePattern) {
      let offsetPos = this.pagePattern.indexOf("=", this.pagePattern.indexOf("offset")) + 1;
      let newOffset = parseInt(this.pagePattern.substring(offsetPos)) + 1;
      this.pagePattern = this.pagePattern.substring(0, offsetPos) + newOffset;
    }
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
    if (commentJson.description != null && commentJson.publication == this.pubId && !commentJson.action_parent) {
      let lastComment: Comment, newCom: Comment;

      //UPDATING THE BACKEND SERVER IP/DOMAIN:
      commentJson.media_profile = ((commentJson.user_register.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + commentJson.user_register.media_profile;
      ////

      //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
      lastComment = this.commentList.find(com => com.commentId === commentJson.id_action);

      if (action != ArrayManager.DELETE) {
        newCom = this._actionService.extractCommentJson(commentJson);
      }

      //STORING THE NEW DATA COMMING FROM SOMEWHERE IN INDEXED-DB:
      this.mainComments[this.mainComments.length] = commentJson;
      upgradeTableFieldDataArray("comment", this.mainComments);
      ////

      if (ArrayManager.backendServerSays(action, this.commentList, lastComment, newCom) == true) {
        if (action == ArrayManager.CREATE) {
          this.updatePattern();
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}
