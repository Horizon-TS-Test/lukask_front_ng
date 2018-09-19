import { Component, OnInit, EventEmitter, Output, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { OnSubmit } from '../../interfaces/on-submit.interface';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import * as Snackbar from 'node-snackbar';

declare var $: any;

@Component({
  selector: 'new-pub',
  templateUrl: './new-pub.component.html',
  styleUrls: ['./new-pub.component.css']
})
export class NewPubComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() showClass: string;
  @Input() isChildPub: boolean;
  @Input() reqSubmit: number;
  @Output() closeModal: EventEmitter<boolean>;
  @Output() streamPub: EventEmitter<boolean>;

  private alertData: Alert;

  public initStream: boolean;
  public hideActionBtns: boolean;
  public matButtons: HorizonButton[];
  public actionType: number;
  public transmitStyle: string;
  public newPubId: string;
  public nextButton: any;
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private _notifierService: NotifierService
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.streamPub = new EventEmitter<boolean>();

    this.initStream = false;
    this.hideActionBtns = false;
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
      this.transmitStyle = "";
    }
    else {
      this.initStream = false;
      this.nextButton = false;
      this.transmitStyle = "secondary";
    }

    if (this.isChildPub) {
      this.streamPub.emit(this.initStream);
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
      this.loadingClass = "on";
      this.activeClass = "active";
    }
    else {
      this.loadingClass = "";
      this.activeClass = "";
    }
  }

  /**
   * MÉTODO PARA MOSTRAR UN ALERTA EN EL DOM:
   */
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  /**
   * MÉTODO PARA PROCESAR EL FORMULARIO DESPUÉS DEL SUBMIT:
   * @param event OBJETO DE TIPO INTERFACE ON-SUBMIT QUE LLEGA DESDE EL EVENT EMITTER
   */
  public onSubmitForm(event: OnSubmit) {
    if (event.finished == true && event.hasError == false) {
      switch (this.actionType) {
        case ACTION_TYPES.submitPub:
          this.closeModal.emit(true);
          break;
        case ACTION_TYPES.pubStream:
          this.showClass = "show";
          this.newPubId = event.dataAfterSubmit;
          this.nextButton = null;
          setTimeout(() => {
            this.nextButton = true;
          });
          this.enableStream();
          break;
      }

      if (event.backSync == true) {
        Snackbar.show({ text: event.message, pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
      }
      else {
        this.alertData = new Alert({ title: 'Proceso Correcto', message: event.message, type: ALERT_TYPES.success });
      }
    }
    else {
      this.showClass = "show";
      this.alertData = new Alert({ title: 'Proceso Fallido', message: event.message, type: ALERT_TYPES.danger });
    }
    setTimeout(() => {
      this.showLoadingContent(!event.finished);
      if (event.backSync != true) {
        this.setAlert();
      }
    }, 200);
  }

  /**
   * MÉTODO PARA ESCUCHAR LOS CAMBIOS QUE SE DEN EN EL ATRIBUTO QUE VIENE DESDE EL COMPONENTE PADRE:
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      switch (property) {
        case 'showClass':
          if (changes[property].currentValue !== undefined) {
            this.showClass = changes[property].currentValue;
          }
          break;
        case 'reqSubmit':
          if (changes[property].currentValue) {
            this.reqSubmit = changes[property].currentValue;
            this.requestSubmit(this.reqSubmit);
          }
          break;
      }
    }
  }

  /**
   * MÉTODO PARA SOLICITAR AL COMPONENTE HIJO QUE SE EFECTÚE EL SUBMIT DE LA PUBLICACIÓN
   */
  private requestSubmit(actionEvent: number) {
    this.actionType = null;
    setTimeout(() => {
      this.actionType = actionEvent;
    });
    this.showLoadingContent(true);
    this.showClass = "";
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      default:
        this.requestSubmit(actionEvent);
        break;
      case ACTION_TYPES.viewComments:
        this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_comments, contentData: { pubId: this.newPubId, halfModal: true, hideBtn: true } });
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }
}
