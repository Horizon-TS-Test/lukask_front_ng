import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Comment } from '../../models/comment';
import { PatternManager } from '../../tools/pattern-manager';
import { ActionService } from '../../services/action.service';
import { DomSanitizer } from '@angular/platform-browser';
import { User } from '../../models/user';
import { SocketService } from '../../services/socket.service';
import { REST_SERV } from '../../rest-url/rest-servers';
import { ArrayManager } from '../../tools/array-manager';

@Component({
  selector: 'comment-reply',
  templateUrl: './comment-reply.component.html',
  styleUrls: ['./comment-reply.component.css']
})
export class CommentReplyComponent implements OnInit {
  @Input() parentComment: Comment;
  @Output() closeModal: EventEmitter<boolean>;

  private _CLOSE = 1;
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  public firstPattern: string;
  public pagePattern: string;

  public matButtons: HorizonButton[];
  public commentForm: Comment;
  public replyList: Comment[];
  public activeClass: string;

  constructor(
    private _actionService: ActionService,
    private _socketService: SocketService
  ) {
    this.closeModal = new EventEmitter<boolean>();

    this.matButtons = [
      {
        parentContentType: 0,
        action: this._CLOSE,
        icon: "close"
      }
    ];

    this.activeClass = this.LOADER_HIDE;

    this.listenToSocket();
  }

  ngOnInit() {
    this.commentForm = new Comment("", "", "", null, this.parentComment.commentId);
    this.getRepies();
  }

  getRepies() {
    this._actionService.getCommentByPub(this.parentComment.commentId, true)
      .then((repliesData: any) => {
        this.replyList = repliesData.comments;
        this.firstPattern = repliesData.pagePattern;
        this.pagePattern = repliesData.pagePattern;
      });
  }

  onCommentResponse(event: Comment) {
    let lastComment: Comment;
    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    lastComment = this.replyList.find(com => com.commentId === event.commentId);

    ArrayManager.backendServerSays("CREATE", this.replyList, lastComment, event);
  }

  /**
   * MÉTODO PARA CARGAR MAS COMENTARIOS
   * @param event EVENTO DEL ELEMENTO <a href="#">
   */
  askForMore(event: any) {
    event.preventDefault();
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      if (this.pagePattern) {
        this._actionService.getMoreCommentByPub(this.parentComment.commentId, true, this.pagePattern)
          .then((repliesData: any) => {
            setTimeout(() => {
              this.activeClass = "";

              setTimeout(() => {
                this.activeClass = this.LOADER_HIDE;
                this.replyList = this.replyList.concat(repliesData.comments);
                this.pagePattern = repliesData.pagePattern;
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
            this.replyList.splice(this._actionService.DEFAULT_LIMIT, this.replyList.length - this._actionService.DEFAULT_LIMIT);
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
   * Y ACTUALIZAR LA LISTA GLOBAL DE RESPUESTAS CON LOS NUEVOS CAMBIOS
   */
  listenToSocket() {
    this._socketService._commentUpdate.subscribe(
      (socketPub: any) => {
        let stream = socketPub.stream;
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
    console.log(commentJson.action_parent);
    if (commentJson.description != null && commentJson.action_parent == this.parentComment.commentId) {
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
      lastComment = this.replyList.find(com => com.commentId === commentJson.id_action);

      if (action != ArrayManager.DELETE) {
        newCom = this._actionService.extractCommentJson(commentJson);
      }

      ArrayManager.backendServerSays(action, this.replyList, lastComment, newCom);
    }
  }

}
