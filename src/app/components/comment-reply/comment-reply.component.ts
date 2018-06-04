import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Comment } from '../../models/comment';
import { PatternManager } from '../../tools/pattern-manager';
import { ActionService } from '../../services/action.service';
import { DomSanitizer } from '@angular/platform-browser';
import { User } from '../../models/user';

@Component({
  selector: 'comment-reply',
  templateUrl: './comment-reply.component.html',
  styleUrls: ['./comment-reply.component.css']
})
export class CommentReplyComponent implements OnInit {
  @Input() mainComment: Comment;
  @Output() closeModal: EventEmitter<boolean>;

  private _CLOSE = 1;

  public matButtons: HorizonButton[];
  public commentForm: Comment;
  public replyList: Comment[];

  constructor(
    private _actionService: ActionService
  ) {
    this.closeModal = new EventEmitter<boolean>();

    this.matButtons = [
      {
        parentContentType: 0,
        action: this._CLOSE,
        icon: "close"
      }
    ];

    this.replyList = this._actionService.getReplyListObj();
  }

  ngOnInit() {
    this.commentForm = new Comment("", "", this.mainComment.publicationId, this.mainComment.user, this.mainComment.commentId);
  }

  onCommentResponse(event: Comment) {
    this.replyList.splice(0, 0, event);
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

}
