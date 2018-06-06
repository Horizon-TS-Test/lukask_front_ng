import { Component, OnInit, Input } from '@angular/core';
import { Comment } from '../../models/comment';
import { DomSanitizer } from '@angular/platform-browser';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';

@Component({
  selector: 'comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input() commentModel: Comment;
  @Input() isReply: boolean;
  @Input() noReplyBtn: boolean;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _notifierService: NotifierService,
  ) { }

  ngOnInit() {
  }

  addNewReply(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.new_reply, contentData: this.commentModel });
  }

}
