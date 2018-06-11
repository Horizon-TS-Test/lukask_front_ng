import { Component, OnInit, Input } from '@angular/core';
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
import { Router } from '@angular/router';

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

  public firstPattern: string;
  public pagePattern: string;

  public newComment: Comment;
  public commentList: Comment[];
  public maxChars: number;
  public restChars: number;
  public activeClass: string;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _notifierService: NotifierService,
    private _actionService: ActionService,
    private _socketService: SocketService,
    private _router: Router,
  ) {
    this.maxChars = 200;
    this.restChars = this.maxChars;
    this.activeClass = this.LOADER_HIDE;

    this.listenToSocket();
  }

  ngOnInit() {
    console.log(this.queja.user_relevance);
    this.resetComment();
    this.getComments();
  }

  resetComment() {
    this.newComment = new Comment("", "", this.queja.id_publication);
  }

  getComments() {
    this._actionService.getCommentByPub(this.queja.id_publication, false)
      .then((commentsData: any) => {
        this.commentList = commentsData.comments;
        this.firstPattern = commentsData.pagePattern;
        this.pagePattern = commentsData.pagePattern;
      });
  }

  viewQuejaDetail(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: this.queja.id_publication });
  }

  onCommentResponse(event: Comment) {
    let lastComment: Comment;
    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    lastComment = this.commentList.find(com => com.commentId === event.commentId);

    ArrayManager.backendServerSays("CREATE", this.commentList, lastComment, event);
  }

  onRelevance(event: any) {
    event.preventDefault();
    this._actionService.sendRelevance(this.queja.id_publication, !this.queja.user_relevance)
      .then((active: boolean) => {
        console.log(active);
        if (active) {
          this.queja.user_relevance = active;
        }
        else {
          this.queja.user_relevance = active;
        }
      })
      .catch((error) => console.log(error));
  }

  /**
   * MÉTODO PARA CARGAR MAS COMENTARIOS
   */
  askForMore(event: any) {
    event.preventDefault();
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      if (this.pagePattern) {
        this._actionService.getMoreCommentByPub(this.queja.id_publication, false, this.pagePattern)
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
            this.commentList.splice(this._actionService.DEFAULT_LIMIT, this.commentList.length - this._actionService.DEFAULT_LIMIT);
          }, 800);
        }, 1000)
      }
    }
  }

  /**
   * MÉTODO PARA GEOLOCALIZAR LA QUEJA SELECCIONADA
   */
  geolocatePub(event: any) {
    event.preventDefault();
    //REF:
    this._router.navigateByUrl(
      this._router.createUrlTree(
        ['/mapview'],
        {
          queryParams: {
            pubId: this.queja.id_publication
          }
        }
      )
    );
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS ACTUALIZACIONES DEL CLIENTE SOCKET.IO
   * QUE TRAE CAMBIOS DESDE EL BACKEND (CREATE/UPDATE/DELETE)
   * Y ACTUALIZAR LA LISTA GLOBAL DE COMENTARIOS CON LOS NUEVOS CAMBIOS
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
    console.log(commentJson.publication);
    if (commentJson.description != null && commentJson.publication == this.queja.id_publication) {
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
