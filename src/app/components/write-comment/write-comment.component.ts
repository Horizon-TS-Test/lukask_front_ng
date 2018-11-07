import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { CONTENT_TYPES } from 'src/app/config/content-type';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { Comment } from 'src/app/models/comment';

@Component({
  selector: 'write-comment',
  templateUrl: './write-comment.component.html',
  styleUrls: ['./write-comment.component.css']
})
export class WriteCommentComponent implements OnInit {
  @Input() commentModel: Comment;

  public secProfImg: any;

  constructor(
    public _userService: UserService,
    public _DynaContentService: DynaContentService
  ) { }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA MOSTRAR 
   * EL CAMPO DE TEXTO PARA ESCRIBIR UN NUEVO COMENTARIO O RESPUESTA:
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   */
  public writeComment(event: any) {
    event.preventDefault();
    this._DynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.comment_input, contentData: this.commentModel });
  }

}
