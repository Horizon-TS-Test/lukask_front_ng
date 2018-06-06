import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Queja } from '../../interfaces/queja.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { Publication } from '../../models/publications';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { Comment } from '../../models/comment';
import { ActionService } from '../../services/action.service';
import { PatternManager } from '../../tools/pattern-manager';
import { Person } from '../../models/person';
import { User } from '../../models/user';
import { SocketService } from '../../services/socket.service';
import { REST_SERV } from '../../rest-url/rest-servers';
import { ArrayManager } from '../../tools/array-manager';

declare var $: any;
declare var writeData: any;

@Component({
  selector: 'app-queja',
  templateUrl: './queja.component.html',
  styleUrls: ['./queja.component.css'],
  providers: [ActionService]
})
export class QuejaComponent implements OnInit {
  @Input() queja: Publication;

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private pagePattern: string;

  public newComment: Comment;
  public commentList: Comment[];
  public maxChars: number;
  public restChars: number;
  public activeClass: string;

  constructor(
    public _domSanitizer: DomSanitizer,
    public _notifierService: NotifierService,
    public _actionService: ActionService,
    public _socketService: SocketService
  ) {
    this.maxChars = 200;
    this.restChars = this.maxChars;

    this.listenToSocket();
  }

  ngOnInit() {
    this.resetComment();
    this._actionService.getCommentByPub(this.queja.id_publication)
      .then((commentsData: any) => {
        this.commentList = commentsData.comments;
        this.pagePattern = commentsData.pagePattern;
      });
  }

  resetComment() {
    this.newComment = new Comment("", "", this.queja.id_publication);
  }

  viewQuejaDetail(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: this.queja.id_publication });
  }

  onCommentResponse(event: Comment) {
    this.commentList.splice(0, 0, event);
  }

  /**
   * MÉTODO PARA CARGAR MAS COMENTARIOS
   */
  askForMore(event: any) {
    event.preventDefault();
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      this._actionService.getMoreCommentByPub(this.queja.id_publication, this.pagePattern)
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
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS ACTUALIZACIONES DEL CLIENTE SOCKET.IO
   * QUE TRAE CAMBIOS DESDE EL BACKEND (CREATE/UPDATE/DELETE)
   * Y ACTUALIZAR LA LISTA GLOBAL DE COMENTARIOS CON LOS NUEVOS CAMBIOS
   */
  listenToSocket() {
    this._socketService._publicationUpdate.subscribe(
      (socketPub: any) => {
        let stream = socketPub.stream;
        let action = socketPub.payload.action.toUpperCase();

        switch (stream) {
          case "comment":
            this.updateCommentList(socketPub.payload.data, action);
            break;
        }
      }
    );
  }

  /**
   * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE PUBLICACIONES
   * @param pubJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
   * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
   */
  updateCommentList(commentJson: any, action: string) {
    let lastComment: Comment, newCom: Comment;

    //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
    commentJson.media_profile = ((commentJson.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + commentJson.media_profile;
    ////

    //STORING THE NEW DATA COMMING FROM SOMEWHERE IN INDEXED-DB:
    if ('indexedDB' in window) {
      writeData('comment', commentJson);
    }
    ////

    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    lastComment = this.commentList.find(com => com.commentId === commentJson.id_action);

    if (action != ArrayManager.DELETE) {
      newCom = this._actionService.extractCommentJson(commentJson);
    }

    ArrayManager.backendServerSays(action, this.commentList, lastComment, newCom);
  }
}
