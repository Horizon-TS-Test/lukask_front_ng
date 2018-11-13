import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Comment } from 'src/app/models/comment';
import { ActionService } from 'src/app/services/action.service';
import { Subscription } from 'rxjs';
import { ArrayManager } from 'src/app/tools/array-manager';
import { CommentFormService } from 'src/app/services/comment-form.service';
import { SocketService } from 'src/app/services/socket.service';
import { REST_SERV } from 'src/app/rest-url/rest-servers';

declare var upgradeTableFieldDataArray: any;
declare var deleteItemData: any;

@Component({
  selector: 'reply-modal',
  templateUrl: './reply-modal.component.html',
  styleUrls: ['./reply-modal.component.css']
})
export class ReplyModalComponent implements OnInit, OnDestroy {
  @Input() parentComment: Comment;
  @Input() focusReplyId: string;

  private subscriptor: Subscription;
  private replySubs: Subscription;
  private mainReplies: any;
  private replyList: Comment[];
  private firstPattern: string;
  private pagePattern: string;
  private pageLimit: number;

  constructor(
    private _actionService: ActionService,
    private _commentFormService: CommentFormService,
    private _socketService: SocketService
  ) {
    this.defineMainReplies();
    this.pageLimit = this._actionService.DEFAULT_LIMIT;
  }

  ngOnInit() {
    this.getReplies();
    this.onCommentResponse();
    this.listenToSocket();
  }

  /**
   * MÉTODO PARA INICIALIZAR LOS DATOS DEL ARRAY SECUNDARIO DE COMENTARIOS:
   */
  private defineMainReplies() {
    this.mainReplies = [];
  }

  /**
   * MÉTODO PARA OBTENER LAS RESPUESTAS OFFLINE, PENDIENTES DE ENVÍO:
   */
  private getOfflineReplies(replyList: Comment[]) {
    this._actionService.getOffCommentsByPub(this.parentComment.commentId, true).then((dataResponse: any) => {
      let offReplies: Comment[] = <Comment[]>dataResponse;
      for (let reply of offReplies) {
        replyList.splice(0, 0, reply);
      }
    });
  }

  /**
   * MÉTODO PARA OBTENER LAS RESPUESTAS DE UN COMENTARIO SEA DE LA WEB O DE LA CACHÉ:
   */
  private getReplies() {
    this._actionService.getCommentByPub(this.parentComment.commentId, true)
      .then((repliesData: any) => {
        this.replyList = repliesData.comments;
        this.firstPattern = repliesData.pagePattern;
        this.pagePattern = repliesData.pagePattern;
        this.getOfflineReplies(this.replyList);
        this._actionService.loadReplies({ comments: this.replyList, pagePattern: repliesData.pagePattern });
      });
  }

  /**
   * MÉTODO PARA CARGAR MAS COMENTARIOS
   * @param event EVENTO DEL ELEMENTO <a href="#">
   */
  public askForMore(event: boolean) {
    if (event) {
      this._actionService.getMoreCommentByPub(this.parentComment.commentId, true, this.pagePattern)
        .then((repliesData: any) => {
          this.pagePattern = repliesData.pagePattern;
          this.replyList = this.replyList.concat(repliesData.comments);

          this._actionService.loadReplies({ comments: this.replyList, pagePattern: this.pagePattern });
        });
    }
    else {
      this.pagePattern = this.firstPattern;
      this.replyList.splice(this.pageLimit, this.replyList.length - this.pageLimit);
      this._actionService.loadReplies({ comments: this.replyList, pagePattern: this.pagePattern });
    }
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL PATTERN QUE VIENE DEL BACKEND PARA NO COMPROMETER LA SECUENCIA 
   * DE REGISTRO A TRAER DEL BACKEND BAJO DEMANDA, CUANDO SE REGISTRE UNA NUEVA RESPUESTA:
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
    this.subscriptor = this._commentFormService.newComment$.subscribe((newRep: Comment) => {
      if (newRep && this.replyList) {
        if (newRep.commentParentId == this.parentComment.commentId) {
          if (newRep.isOffline) {
            this.replyList.splice(0, 0, newRep);
          }
          else {
            let lastReply: Comment;
            //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
            lastReply = this.replyList.find(com => com.commentId === newRep.commentId);

            if (ArrayManager.backendServerSays("CREATE", this.replyList, lastReply, newRep) == true) {
              this.updatePattern();
            }
          }

          this._actionService.loadReplies({ comments: this.replyList, pagePattern: this.pagePattern });
        }
      }
    });
  }

  /**
   * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE PUBLICACIONES
   * @param pubJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
   * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
   */
  updatereplyList(commentJson: any, action: string) {
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

  /**
   * MÉTODO PARA ELIMINAR LA RESPUESTA OFFLINE, CUANDO YA SE HAYA GUARDADO EN EL SERVIDOR Y 
   * VENGA COMO RESPUESTA EN EL SOCKET.IO
   * @param newRep 
   */
  private deleteOffRepAsoc(newRep: Comment) {
    //PARA PODER ELIMINAR UNA PUB OFFLINE, LUEGO DE SER GUARDAR:
    for (let i = 0; i < this.replyList.length; i++) {
      if (this.replyList[i].isOffline) {
        let offDate = new Date(this.replyList[i].dateRegister).getTime();;
        let comDate = new Date(newRep.dateRegister.replace("T", " ").replace("Z", "")).getTime();;

        if (this.replyList[i].description == newRep.description && offDate.toString() == comDate.toString() && this.replyList[i].publicationId == newRep.publicationId && this.replyList[i].commentParentId == newRep.commentParentId && this.replyList[i].user.id == newRep.user.id) {
          this.replyList.splice(i, 1);
        }
      }
    }
    ////
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS ACTUALIZACIONES DEL CLIENTE SOCKET.IO
   * QUE TRAE CAMBIOS DESDE EL BACKEND (CREATE/UPDATE/DELETE)
   * Y ACTUALIZAR LA LISTA GLOBAL DE RESPUESTAS CON LOS NUEVOS CAMBIOS
   */
  private listenToSocket() {
    this.replySubs = this._socketService.commUpdate$.subscribe((socketPub: any) => {
      if (socketPub && this.replyList) {
        let action = socketPub.payload.action.toUpperCase();
        this.updatereplyList(socketPub.payload.data, action);
        this.deleteOffRepAsoc(this._actionService.extractCommentJson(socketPub.payload.data));

        this._actionService.loadReplies({ comments: this.replyList, pagePattern: this.pagePattern });
      }
    });
  }

  /**
   * MÉTODO PARA ELIMINAR UNA RESPUESTA OFFLINE:
   */
  onCancelReply(comment: Comment) {
    this.replyList.splice(this.replyList.indexOf(comment), 1);

    deleteItemData("sync-comment", comment.commentId);
  }

  ngOnDestroy() {
    this._actionService.loadReplies(null);

    this.subscriptor.unsubscribe();
    this.replySubs.unsubscribe();
  }

}
