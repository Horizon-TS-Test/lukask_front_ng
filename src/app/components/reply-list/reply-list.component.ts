import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Comment } from '../../models/comment';
import { ActionService } from '../../services/action.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ASSETS } from 'src/app/config/assets-url';

@Component({
  selector: 'reply-list',
  templateUrl: './reply-list.component.html',
  styleUrls: ['./reply-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReplyListComponent implements OnInit, OnDestroy {
  @ViewChild("replies") replies: ElementRef;
  private repsContainer: any;

  @Input() parentComment: Comment;
  @Input() focusReplyId: string;
  @Output() askForMore = new EventEmitter<boolean>();
  @Output() cancelRep = new EventEmitter<Comment>();

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private subscription: Subscription;

  public firstPattern: string;
  public pagePattern: string;

  public matButtons: HorizonButton[];
  public commentForm: Comment;
  public activeClass: string;
  public preloader: string;

  constructor(
    public _actionService: ActionService,
    public _userService: UserService
  ) {
    this.preloader = ASSETS.preloader;
  }

  ngOnInit() {
    this.repsContainer = this.replies.nativeElement;
    this.commentForm = new Comment("", "", this.parentComment.publicationId, this._userService.getUserProfile(), this.parentComment.commentId);
    this.listenToReplies();
  }

  /**
   * MÉTODO PARA ESCUCHAR A LOS CAMBIOS DE LA LISTA DE COMENTARIOS ENTRANTE:
   */
  private listenToReplies() {
    this.subscription = this._actionService.replies$.subscribe((commentData) => {
      if (commentData) {
        let loader = document.querySelector('.bottom-loader');
        let classList = (loader) ? loader.classList : null;

        if (!this.firstPattern) {
          this.firstPattern = commentData.pagePattern;
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
   * MÉTODO PARA CARGAR MAS RESPUESTAS
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public requestForMore(event: any) {
    if (event) {
      event.preventDefault();
    }

    //REF: https://www.developeracademy.io/blog/add-remove-css-classes-using-javascript/
    let classList = this.repsContainer.querySelector('.bottom-loader').classList;
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      classList.remove(this.LOADER_HIDE);
      classList.add(this.LOADER_ON);

      if (this.pagePattern) {
        setTimeout(() => {
          this.askForMore.emit(true);
        }, 500);
      }
      else {
        setTimeout(() => {
          this.askForMore.emit(false);
        }, 500);
      }
    }
  }

  /**
   * MÉTODO PARA CANCELAR EL ENVÍO DE UN COMENTARIO OFFLINE:
   * @param comment COMENTARIO A SER CANCELADO
   */
  public cancelReply(reply: Comment) {
    this.cancelRep.emit(reply);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
