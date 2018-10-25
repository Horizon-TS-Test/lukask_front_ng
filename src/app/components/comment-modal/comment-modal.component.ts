import { Component, OnInit, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { ACTION_TYPES } from 'src/app/config/action-types';
import { ActionService } from 'src/app/services/action.service';
import { HorizonButton } from 'src/app/interfaces/horizon-button.interface';
import { CommentModalService } from 'src/app/services/comment-modal.service';

@Component({
  selector: 'comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.css']
})
export class CommentModalComponent implements OnInit, OnDestroy {
  @Input() pubId: string;
  @Input() commentId: string;
  @Input() replyId: string;
  @Input() halfModal: boolean;
  @Input() hideBtn: boolean;
  @Input() transparent: boolean;
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<boolean>();

  public matButtons: HorizonButton[];

  constructor(
    private _actionService: ActionService,
    private _commentModalService: CommentModalService
  ) {
    this.matButtons = [
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    if (this.halfModal) {
      this._commentModalService.commentsModalOpened(true);
    }
    
    this.getComments();
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * MÉTODO PARA CARGAR LOS COMENTARIOS DESDE EL BACKEND:
   */
  private getComments() {
    this._actionService.getCommentByPub(this.pubId, false)
      .then((commentsData: any) => {
        //this._actionService.loadUser(commentsData.comments);
      });
  }

  ngOnDestroy() {
    if (this.halfModal) {
      this._commentModalService.commentsModalOpened(false);
    }
  }
}
