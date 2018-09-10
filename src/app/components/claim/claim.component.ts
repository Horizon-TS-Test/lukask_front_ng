import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})
export class ClaimComponent implements OnInit {
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<boolean>();

  public matButtons: HorizonButton[];
  public loadingClass: string;
  public activeClass: string;
  public transmitStyle: string;

  constructor() {
    this.transmitStyle = "secondary";

    this.matButtons = [
      {
        action: ACTION_TYPES.submitPub,
        icon: 'check',
        class: 'animated-btn-h animate-in'
      },
      {
        action: ACTION_TYPES.pubStream,
        icon: 'f',
        customIcon: true,
        class: 'animated-btn-h'
      },
      {
        action: ACTION_TYPES.viewComments,
        icon: 'v',
        customIcon: true,
        class: 'animated-btn-h'
      },
      {
        action: ACTION_TYPES.close,
        icon: 'close'
      }
    ];
  }

  ngOnInit() {
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

}
