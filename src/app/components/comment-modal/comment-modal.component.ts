import { Component, OnInit, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { ACTION_TYPES } from 'src/app/config/action-types';
import { ActionService } from 'src/app/services/action.service';
import { HorizonButton } from 'src/app/interfaces/horizon-button.interface';
import { CommentModalService } from 'src/app/services/comment-modal.service';
import { ActionFeederService } from 'src/app/services/action-feeder.service';
import { Comment } from 'src/app/models/comment';
import { Subscription } from 'rxjs';
import { CommentFormService } from 'src/app/services/comment-form.service';
import { ArrayManager } from 'src/app/tools/array-manager';
import { SocketService } from 'src/app/services/socket.service';

declare var deleteItemData: any;

@Component({
  selector: 'comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.css'],
  providers: [ActionService]
})
export class CommentModalComponent implements OnInit, OnDestroy {
  @Input() pubId: string;
  @Input() commentId: string;
  @Input() replyId: string;
  @Input() halfModal: boolean;
  @Input() hideBtn: boolean;
  @Input() transparent: boolean;
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<boolean>();

  private commentList: Comment[];
  private mainComments: any;
  private newComSubscriptor: Subscription;
  private commentSubs: Subscription;

  public matButtons: HorizonButton[];
  public pagePattern: string;

  constructor(
    private _actionService: ActionService,
    private _commentModalService: CommentModalService,
    private _actionFeederService: ActionFeederService,
    private _commentFormService: CommentFormService,
    private _socketService: SocketService
  ) {
    this.matButtons = [
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    if (this.halfModal) {
      this._commentModalService.commentsModalOpened(true);
    }

    this.defineMainComments();
    this.getComments();
    this.listenToSocket();
    this.onCommentResponse();
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
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
    this._actionFeederService.getComments(this.pubId, true)
      .then((commentData: any) => {
        this.defineMainComments();
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
    this._actionFeederService.askForMore(this.pubId, this.pagePattern, this.commentList, event)
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
        if (newCom.publicationId == this.pubId && !newCom.commentParentId) {
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
          this._actionFeederService.updateCommentList(this.pubId, socketCom.payload.data, action, this.pagePattern, this.commentList, this.mainComments);
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
    this._commentFormService.deleteOffComent(comment);

    deleteItemData("sync-comment", comment.commentId);
  }

  /**
   * MÉTODO PARA NOTIFICAR AL PADRE DE ESTE COMPONENTE QUE UN COMENTARIO HA SIDO APOYADO EN MODO OFFLINE, 
   * PARA CAMBIAR LA APARIENCIA DEL DOM:
   */
  public changeComOffRelevance(comment: Comment) {
    this._actionService.changeComOffRelevance(comment, this.commentList, this.pagePattern);
  }

  ngOnDestroy() {
    this._actionService.loadComments(null);

    this.newComSubscriptor.unsubscribe();
    this.commentSubs.unsubscribe();

    if (this.halfModal) {
      this._commentModalService.commentsModalOpened(false);
    }
  }
}
