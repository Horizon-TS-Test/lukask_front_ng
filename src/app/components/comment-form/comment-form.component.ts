import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionService } from '../../services/action.service';
import { PatternManager } from '../../tools/pattern-manager';
import { Comment } from '../../models/comment';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css'],
  providers: [UserService]
})
export class CommentFormComponent implements OnInit {
  @Input() commentModel: Comment;
  @Output() commentResponse = new EventEmitter<Comment>();

  public maxChars: number;
  public restChars: number;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _actionService: ActionService,
    private _userService: UserService
  ) {
    this.maxChars = 200;
    this.restChars = this.maxChars;
  }

  ngOnInit() {
    this.commentModel.user = this._userService.getStoredUserData();
  }

  validateLettersNumber(event: KeyboardEvent) {
    this.restChars = PatternManager.limitWords(this.maxChars, this.commentModel.description.length);
  }

  resetComment() {
    this.commentModel.description = "";
  }

  publishComment() {
    this._actionService.sendComment(this.commentModel)
      .then((response) => {
        console.log(response);
        this.commentResponse.emit(this._actionService.extractCommentJson(response));

        this.resetComment();
        this.validateLettersNumber(null);
      })
      .catch(err => {
        console.log(err);
      });
  }

}
