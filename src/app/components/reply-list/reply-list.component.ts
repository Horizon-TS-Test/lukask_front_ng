import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Comment } from '../../models/comment';
import { ActionService } from '../../services/action.service';
import { SocketService } from '../../services/socket.service';
import { REST_SERV } from '../../rest-url/rest-servers';
import { ArrayManager } from '../../tools/array-manager';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';

declare var upgradeTableFieldDataArray: any;

@Component({
  selector: 'reply-list',
  templateUrl: './reply-list.component.html',
  styleUrls: ['./reply-list.component.css']
})
export class ReplyListComponent implements OnInit, OnDestroy {
  @Input() parentComment: Comment;
  @Output() closeModal: EventEmitter<boolean>;

  private _CLOSE = 1;
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";
  private mainReplies: any;
  private subscriptor: Subscription;

  public firstPattern: string;
  public pagePattern: string;

  public matButtons: HorizonButton[];
  public commentForm: Comment;
  public replyList: Comment[];
  public activeClass: string;

  constructor(
    private _actionService: ActionService,
    private _socketService: SocketService,
    private _notifierService: NotifierService
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.activeClass = this.LOADER_HIDE;
    this.matButtons = [
      {
        parentContentType: 0,
        action: this._CLOSE,
        icon: "close"
      }
    ];

    this.defineMainComments();
    this.listenToSocket();
  }

  ngOnInit() {
    this.commentForm = new Comment("", "", "", null, this.parentComment.commentId);
    this.getReplies();
    this.onCommentResponse();
  }

  /**
   * MÉTODO PARA INICIALIZAR LOS DATOS DEL ARRAY SECUNDARIO DE COMENTARIOS:
   */
  defineMainComments() {
    this.mainReplies = [];
  }

  /**
   * MÉTODO PARA OBTENER LAS RESPUESTAS DE UN COMENTARIO SEA DE LA WEB O DE LA CACHÉ:
   */
  getReplies() {
    this._actionService.getCommentByPub(this.parentComment.commentId, true)
      .then((repliesData: any) => {
        this.defineMainComments();
        this.replyList = repliesData.comments;
        this.firstPattern = repliesData.pagePattern;
        this.pagePattern = repliesData.pagePattern;
      });
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS EMISIONES DEL OBJETO EVENT-EMITER DEL COMPONENTE HIJO,
   * EL NUEVO COMENTARIO QUE DEVUELVE EL COMPONENTE HIJO, PROVENIENTE DEL BACKEND:
   */
  onCommentResponse() {
    this.subscriptor = this._notifierService._newCommentResp.subscribe((newRep: Comment) => {
      if (newRep.commentParentId == this.parentComment.commentId) {
        let lastReply: Comment;
        //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
        lastReply = this.replyList.find(com => com.commentId === newRep.commentId);

        if (ArrayManager.backendServerSays("CREATE", this.replyList, lastReply, newRep) == true) {
          this.updatePattern();
        }
      }
    });
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL PATTERN QUE VIENE DEL BACKEND PARA NO COMPROMETER LA SECUENCIA 
   * DE REGISTRO A TRAER DEL BACKEND BAJO DEMANDA, CUANDO SE REGISTRE UNA NUEVA RESPUESTA:
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
            this.replyList.splice(this._actionService.pageLimit, this.replyList.length - this._actionService.pageLimit);
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
    if (commentJson.description != null && commentJson.action_parent == this.parentComment.commentId) {
      let lastReply: Comment, newRep: Comment;

      //UPDATING THE BACKEND SERVER IP/DOMAIN:
      commentJson.media_profile = ((commentJson.user_register.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + commentJson.user_register.media_profile;
      ////

      //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
      lastReply = (this.replyList) ? this.replyList.find(com => com.commentId === commentJson.id_action) : null;

      if (action != ArrayManager.DELETE) {
        newRep = this._actionService.extractCommentJson(commentJson);
      }

      //STORING THE NEW DATA COMMING FROM SOMEWHERE IN INDEXED-DB:
      this.mainReplies[this.mainReplies.length] = commentJson;
      upgradeTableFieldDataArray("reply", this.mainReplies);
      ////

      if (ArrayManager.backendServerSays(action, this.replyList, lastReply, newRep) == true) {
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
