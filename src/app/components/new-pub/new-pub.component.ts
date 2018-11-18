import { Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { OnSubmit } from '../../interfaces/on-submit.interface';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import { Router } from '@angular/router';
import { CONTENT_TYPES } from 'src/app/config/content-type';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { UserService } from 'src/app/services/user.service';
import { EersaClient } from 'src/app/models/eersa-client';
import { EersaLocation } from 'src/app/models/eersa-location';
import { BTN_APPAREANCE } from 'src/app/config/button-appearance';
import * as Snackbar from 'node-snackbar';

@Component({
  selector: 'new-pub',
  templateUrl: './new-pub.component.html',
  styleUrls: ['./new-pub.component.css']
})
export class NewPubComponent implements OnInit, OnChanges {
  @Input() showClass: string;
  @Input() isChildPub: boolean;
  @Input() reqSubmit: number;
  @Input() eersaLocClient: { eersaClient: EersaClient, eersaLocation: EersaLocation };

  @Output() closeModal: EventEmitter<boolean>;
  @Output() streamPub: EventEmitter<boolean>;
  @Output() validForm = new EventEmitter<boolean>();

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
    private _dynaContentService: DynaContentService,
    private _userService: UserService,
    public _router: Router
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.streamPub = new EventEmitter<boolean>();

    this.initStream = false;
    this.hideActionBtns = false;
    this.transmitStyle = "secondary";
  }

  ngOnInit() {
    this.initButtons();
  }

  /**
   * MÉTODO PARA INICIALIZAR LOS BOTONES A USAR:
   */
  private initButtons() {
    if (!this.isChildPub) {
      this.matButtons = [
        {
          action: ACTION_TYPES.submitPub,
          icon: 'check',
          class: 'custom-btn-normal animated-btn-h animate-in',
          appearance: BTN_APPAREANCE.normal
        },
        {
          action: ACTION_TYPES.pubStream,
          icon: 'f',
          customIcon: true,
          class: 'custom-btn-normal animated-btn-h',
          appearance: BTN_APPAREANCE.normal
        },
        {
          action: ACTION_TYPES.close,
          icon: 'close'
        }
      ];
    }
  }

  /**
   * MÉTODO PARA ACCEDER A LA OPCIÓN DE INICIAR STREAMING:
   * @param event
   */
  public initStreaming(event: any) {
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
   * MÉTODO PARA ABRIR EL RECURSO QUE LLEGA JUNTO CON LA NOTIFICACIÓN:
   */
  private openStreaming() {
    this._dynaContentService.removeDynaContent(true);
    this._router.navigateByUrl('/streaming?pub=' + this.newPubId);
  }

  /**
   * MÉTODO PARA PROCESAR EL FORMULARIO DESPUÉS DEL SUBMIT:
   * @param event OBJETO DE TIPO INTERFACE ON-SUBMIT QUE LLEGA DESDE EL EVENT EMITTER
   */
  public onSubmitForm(event: OnSubmit) {
    let alertData: Alert;
    if (event.finished == true && event.hasError == false) {
      switch (this.actionType) {
        case ACTION_TYPES.submitPub:
          this.closeModal.emit(true);

          if (event.backSync == true) {
            Snackbar.show({ text: event.message, pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
          }
          else {
            alertData = new Alert({ title: 'Proceso Correcto', message: event.message, type: ALERT_TYPES.success });
          }
          break;
        case ACTION_TYPES.pubStream:
          this.newPubId = event.dataAfterSubmit;
          this._userService.onStreaming = true;
          this.openStreaming();
          break;
      }

    }
    else {
      this.showClass = "show";
      alertData = new Alert({ title: 'Proceso Fallido', message: event.message, type: ALERT_TYPES.danger });
    }
    if (this.actionType != ACTION_TYPES.pubStream) {
      setTimeout(() => {
        this.showLoadingContent(!event.finished);
        if (event.backSync != true) {
          this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.alert, contentData: alertData });
        }
      }, 200);
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
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * METODO PARA DETECTAR QUE EL FORMULARIO DE QUEJA/RECLAMO ES VÁLIDO
   * @param event VALOR QUE VIENE DEL OBJETO EVENT EMITTER:
   */
  public onValidForm(event: boolean) {
    this.validForm.emit(event);
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
        case 'eersaLocClient':
          if (changes[property].currentValue) {
            this.eersaLocClient = changes[property].currentValue;
          }
          break;
      }
    }
  }
}
