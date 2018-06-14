import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionService } from '../../services/action.service';
import { PatternManager } from '../../tools/pattern-manager';
import { Comment } from '../../models/comment';
import { UserService } from '../../services/user.service';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';

@Component({
  selector: 'comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css'],
  providers: [UserService]
})
export class CommentFormComponent implements OnInit {
  @Input() commentModel: Comment;
  @Input() modalForm: boolean;
  @Output() commentResponse = new EventEmitter<Comment>();
  @Output() closeModal = new EventEmitter<boolean>();

  public maxChars: number;
  public restChars: number;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _actionService: ActionService,
    private _userService: UserService,
    private _notifierService: NotifierService
  ) {
    this.maxChars = 200;
    this.restChars = this.maxChars;
  }

  ngOnInit() {
    this.commentModel.user = this._userService.getStoredUserData();
  }

  /**
   * MÉTODO PARA CONTROLAR EL LÍMITE MÁXIMO DE CARACTERES A INGRESAR EN UN COMENTARIO O RESPUESTA:
   * @param event EVENTO DE KEYPRESS
   */
  validateLettersNumber(event: KeyboardEvent) {
    this.restChars = PatternManager.limitWords(this.maxChars, this.commentModel.description.length);
  }

  /**
   * MÉTODO PARA RESETEAR EL CAMPO DE TEXTO DEL TEMPLATE DRIVEN FORM:
   */
  resetComment() {
    this.commentModel.description = "";
  }

  /**
   * MÉTODO PARA ENVIAR UN COMENTARIO AL BACKEND:
   */
  publishComment() {
    this._actionService.sendComment(this.commentModel)
      .then((response) => {
        console.log(response);
        this.commentResponse.emit(this._actionService.extractCommentJson(response));

        this.resetComment();
        this.validateLettersNumber(null);
        
        this.closeModal.emit(true);
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA MOSTRAR 
   * EL CAMPO DE TEXTO PARA ESCRIBIR UN NUEVO COMENTARIO O RESPUESTA:
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   */
  writeComment(event: any) {
    event.preventDefault();
    if (this.modalForm == false) {
      this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.comment_input, contentData: this.commentModel });
    }
  }

}
