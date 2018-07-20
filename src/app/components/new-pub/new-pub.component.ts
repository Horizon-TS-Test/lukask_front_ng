import { Component, OnInit, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { OnSubmit } from '../../interfaces/on-submit.interface';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';

declare var $: any;

@Component({
  selector: 'new-pub',
  templateUrl: './new-pub.component.html',
  styleUrls: ['./new-pub.component.css']
})
export class NewPubComponent implements OnInit, AfterViewInit {
  @Output() closeModal = new EventEmitter<boolean>();

  public startCamera: boolean;
  public initStream: boolean;
  public hideActionBtns: boolean;
  public matButtons: HorizonButton[];
  public actionType: number;
  public transmitStyle: string;
  public newPubId: string;
  public nextButton: any;

  constructor(
    private _notifierService: NotifierService
  ) {
    this.initStream = false;
    this.startCamera = false;
    this.hideActionBtns = false;
    this.matButtons = [
      {
        action: ACTION_TYPES.submitPub,
        icon: 'check',
        class: 'animated-btn animate-in'
      },
      {
        action: ACTION_TYPES.pubStream,
        icon: 'f',
        customIcon: true,
        class: 'animated-btn'
      },
      {
        action: ACTION_TYPES.viewComments,
        icon: 'v',
        customIcon: true,
        class: 'animated-btn'
      },
      {
        action: ACTION_TYPES.close,
        icon: 'close'
      }
    ];
  }

  ngOnInit() { }

  ngAfterViewInit() { }

  /**
   * MÉTODO PARA ACCEDER A LA OPCIÓN DE INICIAR STREAMING:
   * @param event
   */
  initStreaming(event: any) {
    event.preventDefault();

    if (this.initStream === false) {
      this.initStream = true;
      this.nextButton = true;
      this.transmitStyle = "selected";
    }
    else {
      this.initStream = false;
      this.nextButton = false;
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
    this.hideActionBtns = true;
  }

  /**
   * MÉTODO PARA OCULTAR O MOSTRAR EL FONDO DE CARGANDO
   */
  private showLoadingContent(show: boolean) {
    if (show == true) {
      $("#loading-content").parent().css("opacity", ".6");
      $("#loading-content").addClass("active");
    }
    else {
      $("#loading-content").removeClass("active");
      $("#loading-content").parent().css("opacity", "1");
    }
  }

  /**
   * MÉTODO PARA PROCESAR EL FORMULARIO DESPUÉS DEL SUBMIT:
   * @param event OBJETO DE TIPO INTERFACE ON-SUBMIT QUE LLEGA DESDE EL EVENT EMITTER
   */
  public onSubmitForm(event: OnSubmit) {
    this.showLoadingContent(!event.finished);
    if (event.finished == true && !event.hasError) {
      switch (this.actionType) {
        case ACTION_TYPES.submitPub:
          this.closeModal.emit(true);
          break;
        case ACTION_TYPES.pubStream:
          this.newPubId = event.dataAfterSubmit;
          this.nextButton = null;
          setTimeout(() => {
            this.nextButton = true;
          });
          this.enableStream();
          break;
      }
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      default:
        this.actionType = actionEvent;
        this.showLoadingContent(true);
        break;
      case ACTION_TYPES.viewComments:
        this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_comments, contentData: { pubId: this.newPubId, halfModal: true } });
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }
}
