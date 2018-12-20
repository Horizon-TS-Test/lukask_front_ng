import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ActionService } from '../../services/action.service';
import { Comment } from '../../models/comment';
import { Subscription } from 'rxjs';
import { ContentService } from '../../services/content.service';
import { UserService } from 'src/app/services/user.service';
import { ASSETS } from 'src/app/config/assets-url';

declare var $: any;

@Component({
  selector: 'comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentListComponent implements OnInit, OnDestroy {
  @ViewChild("comments") comments: ElementRef;
  private comsContainer: any;

  @Input() pubId: string;
  @Input() commentId: string;
  @Input() replyId: string;
  @Input() transparent: boolean;
  @Input() hideBtn: boolean;
  @Input() fromModal: boolean;
  @Output() askForMore = new EventEmitter<boolean>();
  @Output() cancelCom = new EventEmitter<Comment>();
  @Output() changeComOffRelev = new EventEmitter<Comment>();

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private subscription: Subscription;
  private container: any;

  public firstPattern: string;
  public pagePattern: string;

  public newComment: Comment;
  public activeClass: string;
  public preloader: string;

  constructor(
    public _actionService: ActionService,
    public _userService: UserService,
    private _contentService: ContentService
  ) {
    this.activeClass = this.LOADER_HIDE;
    this.preloader = ASSETS.preloader;
  }

  ngOnInit() {
    this.comsContainer = this.comments.nativeElement;
    this.listenToComments();

    this.resetComment();
  }

  /**
   * METODO PARA ESCUCHAR A LOS CAMBIOS DE LA LISTA DE COMENTARIOS ENTRANTE:
   */
  private listenToComments() {
    this.subscription = this._actionService.comms$.subscribe((commentData) => {
      if (commentData) {
        let loader = this.comsContainer.querySelector('.bottom-loader');
        let classList = (loader) ? loader.classList : null;

        if (!this.firstPattern) {
          this.firstPattern = commentData.pagePattern;
          /**
           * PARA ASEGURARSE QUE EL EVENTO DEL SCROLL FUNCIONE JUSTO DESPUÉS DE QUE LLEGUE LA ACTUALIZACIÓN DEL OBSERVABLE
           */
          setTimeout(() => {
            this.onScrollCommentContainer();
          }, 500);
        }
        this.pagePattern = commentData.pagePattern;

        if (classList) {
          setTimeout(() => {
            this.activeClass = "";
            classList.remove(this.LOADER_ON);

            setTimeout(() => {
              this.activeClass = this.LOADER_HIDE;
              classList.add(this.LOADER_HIDE);
            }, 800);
          }, 1000);
        }
      }
    });
  }

  /**
   * METODO PARA MANIPULAR EL EVENTO DE SCROLL DENTRO DEL COMPONENTE PRINCIPAL DE COMENTARIO:
   */
  private onScrollCommentContainer() {
    this.container = $('#comentsBody');
    this.container.scroll(() => {
      if (this._contentService.isBottomScroll(this.container)) {
        this.requestForMore(null);
      }
    });
  }

  /**
   * METODO PARA INICIALIZAR EL OBJETO DE TIPO COMMENT PARA REGISTRAR UN NUEVO COMENTARIO:
   */
  private resetComment() {
    this.newComment = new Comment("", "", this.pubId, this._userService.getUserProfile());
  }

  /**
   * METODO PARA CARGAR MAS COMENTARIOS
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public requestForMore(event: any) {
    if (event) {
      event.preventDefault();
    }

    if (this.activeClass != this.LOADER_ON) {
      //REF: https://www.developeracademy.io/blog/add-remove-css-classes-using-javascript/
      let classList = this.comsContainer.querySelector('.bottom-loader').classList;

      this.activeClass = this.LOADER_ON;
      classList.remove(this.LOADER_HIDE);
      classList.add(this.LOADER_ON);

      if (this.pagePattern) {
        setTimeout(() => {
          this.askForMore.emit(true);
        }, 500);
      }
      else {
        if (!this.transparent) {
          setTimeout(() => {
            this.askForMore.emit(false);
          }, 500);
        }
        else {
          setTimeout(() => {
            this.activeClass = "";
            classList.remove(this.LOADER_ON);

            setTimeout(() => {
              this.activeClass = this.LOADER_HIDE;
              classList.add(this.LOADER_HIDE);
            }, 800);
          }, 1000);
        }
      }
    }
  }

  /**
   * METODO PARA CANCELAR EL ENVÍO DE UN COMENTARIO OFFLINE:
   * @param comment COMENTARIO A SER CANCELADO
   */
  public cancelComment(comment: Comment) {
    this.cancelCom.emit(comment);
  }

  /**
   * METODO PARA NOTIFICAR AL PADRE DE ESTE COMPONENTE QUE UN COMENTARIO HA SIDO APOYADO EN MODO OFFLINE, 
   * PARA CAMBIAR LA APARIENCIA DEL DOM:
   */
  public changeComOffRelevance(comment: Comment) {
    this.changeComOffRelev.emit(comment);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
