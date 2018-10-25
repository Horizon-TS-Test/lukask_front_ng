import { Component, OnInit, Input, OnDestroy, AfterViewInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { ActionService } from '../../services/action.service';
import { Comment } from '../../models/comment';
import { ArrayManager } from '../../tools/array-manager';
import { SocketService } from '../../services/socket.service';
import { REST_SERV } from '../../rest-url/rest-servers';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Subscription } from 'rxjs';
import { ACTION_TYPES } from '../../config/action-types';
import { ContentService } from '../../services/content.service';

declare var $: any;
declare var readAllData: any;
declare var writeData: any;
declare var deleteItemData: any;
declare var upgradeTableFieldDataArray: any;

@Component({
  selector: 'comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() pubId: string;
  @Input() commentId: string;
  @Input() replyId: string;
  @Input() transparent: boolean;
  @Input() hideBtn: boolean;
  @Input() fromModal: boolean;
  @Output() askForMore = new EventEmitter<boolean>();

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private subscription: Subscription;
  private subscriptor: Subscription;
  private commentSubs: Subscription;
  private mainComments: any;
  private container: any;

  public firstPattern: string;
  public pagePattern: string;

  public newComment: Comment;
  public activeClass: string;

  constructor(
    private _actionService: ActionService,
    private _socketService: SocketService,
    private _contentService: ContentService,
  ) {
    this.activeClass = this.LOADER_HIDE;
    this.subscription = this._actionService.comms$.subscribe((commentData) => {
      if (commentData) {
        if (!this.firstPattern) {
          this.firstPattern = commentData.pagePattern;
        }
        this.pagePattern = commentData.pagePattern;

        setTimeout(() => {
          this.activeClass = "";

          setTimeout(() => {
            this.activeClass = this.LOADER_HIDE;
            console.log("this.activeClass", this.activeClass);
          }, 800);

        }, 1000);
      }
    });
  }

  ngOnInit() {
    this.resetComment();
    this.defineMainComments();
    this.listenToSocket();
  }

  /**
   * MÉTODO PARA MANIPULAR EL EVENTO DE SCROLL DENTRO DEL COMPONENTE PRINCIPAL DE COMENTARIO:
   */
  private onScrollCommentContainer() {
    this.container = $('#comentsBody');
    this.container.scroll(() => {
      if (this._contentService.isBottomScroll(this.container)) {
        //this.askForMore(null);
      }
    });
  }

  ngAfterViewInit() {
    //this.getComments();
    this.onCommentResponse();
    //this.onScrollCommentContainer();
  }

  /**
   * MÉTODO PARA INICIALIZAR LOS DATOS DEL ARRAY SECUNDARIO DE COMENTARIOS:
   */
  private defineMainComments() {
    this.mainComments = [];
  }

  /**
   * MÉTODO PARA INICIALIZAR EL OBJETO DE TIPO COMMENT PARA REGISTRAR UN NUEVO COMENTARIO:
   */
  private resetComment() {
    this.newComment = new Comment("", "", this.pubId);
  }

  /**
   * MÉTODO PARA CARGAR LOS COMENTARIOS DESDE EL BACKEND:
   */
  /*private getComments() {
    if (this.isModal == true) {
      this._actionService.pageLimit = this._actionService.MOBILE_LIMIT;
    }
    this._actionService.getCommentByPub(this.pubId, false)
      .then((commentsData: any) => {
        this.defineMainComments();
        this.commentList = commentsData.comments;
        this.getOfflineComRelevances(this.commentList);
        this.getOfflineComments();

        this.firstPattern = commentsData.pagePattern;
        this.pagePattern = commentsData.pagePattern;
      });
  }*/

  /**
   * MÉTODO PARA ESCUCHAR LAS EMISIONES DEL OBJETO EVENT-EMITER DEL COMPONENTE HIJO,
   * EL NUEVO COMENTARIO QUE DEVUELVE EL COMPONENTE HIJO, PROVENIENTE DEL BACKEND:
   */
  private onCommentResponse() {
    /*this.subscriptor = this._notifierService._newCommentResp.subscribe((newCom: Comment) => {
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
      }
    });*/
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
   * MÉTODO PARA CARGAR MAS COMENTARIOS
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public requestForMore(event: any) {
    if (event) {
      event.preventDefault();
    }
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      if (this.pagePattern) {
        this.askForMore.emit(true);
      }
      else {
        setTimeout(() => {
          this.activeClass = "";

          if (!this.transparent) {
            setTimeout(() => {
              this.activeClass = this.LOADER_HIDE;
            }, 800);
          }
        }, 1000)
      }
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS ACTUALIZACIONES DEL CLIENTE SOCKET.IO
   * QUE TRAE CAMBIOS DESDE EL BACKEND (CREATE/UPDATE/DELETE)
   * Y ACTUALIZAR LA LISTA GLOBAL DE COMENTARIOS CON LOS NUEVOS CAMBIOS
   */
  private listenToSocket() {
    this.commentSubs = this._socketService._commentUpdate.subscribe(
      (socketPub: any) => {
        let action = socketPub.payload.action.toUpperCase();

        if (socketPub.payload.data.description != null) {
          //this.updateCommentList(socketPub.payload.data, action);
          this.deleteOffComAsoc(this._actionService.extractCommentJson(socketPub.payload.data));
        }
        else {
          //this.updateRelevanceCounter(socketPub.payload.data);
        }
      }
    );
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL REGISTRO EN INDEXED-DB
   */
  private updateRelNumberIndexDb(comId: string, newRelCount: number, userId: any) {
    readAllData("comment")
      .then(function (tableData) {
        let dataToSave;
        for (var t = 0; t < tableData.length; t++) {
          if (tableData[t].id_action === comId) {
            dataToSave = tableData[t];
            dataToSave.count_relevance = newRelCount;
            if (userId == dataToSave.user_register.id) {
              dataToSave.user_relevance = true;
            }
            deleteItemData("comment", tableData[t].id_action)
              .then(function () {
                writeData("comment", dataToSave);
              });
            t = tableData.length;
          }
        }
      });
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL NUMERO DE RELEVANCIAS DE UN COMENTARIO:
   */
  /*private updateRelevanceCounter(actionData) {
    if (actionData.action_parent) {
      let currentComment = this.commentList.find(com => com.commentId == actionData.action_parent);

      if (currentComment) {
        this._actionService.getCommentById(actionData.action_parent).then((newCom: Comment) => {
          ArrayManager.backendServerSays("UPDATE", this.commentList, currentComment, newCom)
          this.updateRelNumberIndexDb(actionData.id_action, newCom.relevance_counter, actionData.user_register.id);
        });
      }

    }
  }*/

  /**
   * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE PUBLICACIONES
   * @param pubJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
   * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
   */
  /*private updateCommentList(commentJson: any, action: string) {
    if (commentJson.publication == this.pubId && !commentJson.action_parent) {
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
  }*/

  /**
   * MÉTODO PARA OBTENER LOS COMENTARIOS OFFLINE, PENDIENTES DE ENVÍO:
   */
  /*private getOfflineComments() {
    this._actionService.getOffCommentsByPub(this.pubId).then((dataResponse: any) => {
      let offComments: Comment[] = <Comment[]>dataResponse;
      for (let comment of offComments) {
        this.commentList.splice(0, 0, comment);
      }
    });
  }*/

  /**
   * MÉTODO PARA CANCELAR EL ENVÍO DE UN COMENTARIO OFFLINE:
   * @param comment COMENTARIO A SER CANCELADO
   */
  public cancelComment(comment: Comment) {
    //this.commentList.splice(this.commentList.indexOf(comment), 1);

    deleteItemData("sync-comment", comment.commentId);
  }

  /**
   * MÉTODO PARA ELIMINAR EL COMENTARIO OFFLINE, CUANDO YA SE HAYA GUARDADO EN EL SERVIDOR Y 
   * VENGA COMO RESPUESTA EN EL SOCKET.IO
   * @param newCom 
   */
  private deleteOffComAsoc(newCom: Comment) {
    //PARA PODER ELIMINAR UNA PUB OFFLINE, LUEGO DE SER GUARDAR:
    /*for (let i = 0; i < this.commentList.length; i++) {
      if (this.commentList[i].isOffline) {
        let offDate = new Date(this.commentList[i].dateRegister).getTime();;
        let comDate = new Date(newCom.dateRegister.replace("T", " ").replace("Z", "")).getTime();;

        if (this.commentList[i].description == newCom.description && offDate.toString() == comDate.toString() && this.commentList[i].publicationId == newCom.publicationId && this.commentList[i].commentParentId == newCom.commentParentId && this.commentList[i].user.id == newCom.user.id) {
          this.commentList.splice(i, 1);
        }
      }
    }*/
    ////
  }

  /**
   * MÉTODO PARA OBTENER LAS RELEVANCIAS OFFLINE DESDE LA CACHÉ, PARA AÑADIR ESTILOS A LOS COMENTARIOS,
   * AL MOMENTO DE RECARGAR LA PÁGIN ESTANDO EN MODO OFFLINE:
   */
  public getOfflineComRelevances(comList: Comment[]) {
    if ('indexedDB' in window) {
      readAllData('sync-relevance')
        .then((offPubRelevances) => {
          for (let pubRel of offPubRelevances) {
            if (pubRel.action_parent) {
              for (let i = 0; i < comList.length; i++) {
                if (comList[i].commentId == pubRel.action_parent) {
                  comList[i].offRelevance = true;
                }
              }
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    //this.subscriptor.unsubscribe();
    //this.commentSubs.unsubscribe();
  }
}
