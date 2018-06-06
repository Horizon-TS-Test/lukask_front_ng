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
  public commentReply: Comment;
  public maxChars: number;
  public restChars: number;
  public replyList: Comment[];

  constructor(
    public _domSanitizer: DomSanitizer,
    private _actionService: ActionService
  ) {
    this.closeModal = new EventEmitter<boolean>();

    this.maxChars = 200;
    this.restChars = this.maxChars;

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
    this.resetComment();
  }

  resetComment() {
    this.commentReply = new Comment("", "", "", this.mainComment.user, this.mainComment.commentId);
  }

  validateLettersNumber(event: KeyboardEvent) {
    this.restChars = PatternManager.limitWords(this.maxChars, this.commentReply.description.length);
  }

  publishReply() {
    this._actionService.sendComment(this.commentReply)
      .then((response) => {
        console.log(response);
        this.replyList.splice(0, 0, this.extractReplyJson(response));

        this.resetComment();
        this.validateLettersNumber(null);
      })
      .catch(err => {
        console.log(err);
      });
  }

  extractReplyJson(commentJson: any) {
    //return new Comment(commentJson.id_action, commentJson.description, commentJson.publication, new User(commentJson.user_name, "", commentJson.media_profile), commentJson.action_parent);
    return new Comment(commentJson.id_action, commentJson.description, commentJson.publication, new User(this.mainComment.user.username, "", this.mainComment.user.profileImg), commentJson.action_parent);
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
