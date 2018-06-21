import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Comment } from '../../models/comment';
import { DomSanitizer } from '@angular/platform-browser';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit, OnDestroy {
  @Input() commentModel: Comment;
  @Input() isReply: boolean;
  @Input() noReplyBtn: boolean;

  private subscription: Subscription;
  public userProfile: User;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _notifierService: NotifierService,
    private _userService: UserService
  ) {
    this.subscription = this._userService._userUpdate.subscribe((update: boolean) => {
      if (update) {
        this.setOwnUserProfile();
      }
    });
  }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL OBJETO USUARIO DE LOS COMENTARIOS DEL 
   * USUARIOS LOGEADOAL MOMENTO DE ACTUALIZAR EL PERFIL DE USUARIO:
   */
  setOwnUserProfile() {
    this.userProfile = this._userService.getUserProfile();
    if (this.commentModel.user.id == this.userProfile.id) {
      this.commentModel.user = this.userProfile;
    }
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA MOSTRAR LAS RESPUESTAS DE UN COMENTARIO:
   * @param event 
   */
  addNewReply(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_replies, contentData: this.commentModel });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
