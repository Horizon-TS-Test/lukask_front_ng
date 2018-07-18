import { Component, OnInit, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';

declare var $: any;

@Component({
  selector: 'new-pub',
  templateUrl: './new-pub.component.html',
  styleUrls: ['./new-pub.component.css']
})
export class NewPubComponent implements OnInit, AfterViewInit {
  @Output() closeModal = new EventEmitter<boolean>();

  public openStream: boolean;
  public initStream: boolean;
  public matButtons: HorizonButton[];
  public actionType: number;
  public transmitStyle: string;

  constructor() {
    this.initStream = false;
    this.openStream = false;
    this.matButtons = [
      {
        parentContentType: 0,
        action: ACTION_TYPES.submitPub,
        icon: 'check',
        class: 'animated-btn animate-in'
      },
      {
        parentContentType: 0,
        action: ACTION_TYPES.pubStream,
        icon: 'f',
        customIcon: true,
        class: 'animated-btn'
      },
      {
        parentContentType: 0,
        action: ACTION_TYPES.close,
        icon: 'close'
      }
    ];
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  /**
   * MÉTODO PARA ACCEDER A LA OPCIÓN DE INICIAR STREAMING:
   * @param event 
   * @param cancel PARA SALIR DE LA OPCIÓN DE INICIAR STREAMING
   */
  initStreaming(event: any) {
    event.preventDefault();

    if (this.initStream === false) {
      this.initStream = true;
      this.transmitStyle = "selected";
    }
    else {
      this.initStream = false;
      this.transmitStyle = null;
    }
  }

  /**
   * MÉTODO PARA DESLIZAR EN PRIMER PLANO LA INTERFAZ DE STREAMING:
   */
  private enableStream() {
    const normalPub = $("#normalPub");
    const streamingPub = $("#streamingPub");
    streamingPub.removeClass("next");
    normalPub.addClass("prev");
    this.openStream = true;
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      default:
        this.actionType = actionEvent;
        break;
      case ACTION_TYPES.pubStream:
        this.actionType = actionEvent;
        this.enableStream();
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }
}
