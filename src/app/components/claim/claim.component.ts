import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { EersaClient } from 'src/app/models/eersa-client';
import { EersaLocation } from 'src/app/models/eersa-location';
import { BTN_APPAREANCE } from 'src/app/config/button-appearance';
import * as Snackbar from 'node-snackbar';

declare var $: any;

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})
export class ClaimComponent implements OnInit {
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<boolean>();

  private prevBtnColor: string;
  private nextBtnColor: string;
  private nextBtnIcon: string;
  private initStream: boolean;
  private btnAppearance: number;

  public aceptedTerms: boolean;
  public matButtons: HorizonButton[];
  public loadingClass: string;
  public activeClass: string;
  public transmitStyle: string;
  public selectedCause: string;
  public currentStep: number;
  public reqSubmit: number;
  public isLoading: boolean;

  public eersaLocClient: { eersaClient: EersaClient; eersaLocation: EersaLocation; };

  constructor() {
    this.isLoading = true;
    this.currentStep = 0;
    this.aceptedTerms = false;
    this.initStream = false;
    this.prevBtnColor = '';
    this.transmitStyle = "secondary";
    this.nextBtnColor = 'animate-in';
    this.nextBtnIcon = 'chevron-right';
    this.btnAppearance = BTN_APPAREANCE.light;
  }

  ngOnInit() {
    this.initButtons();
  }

  /**
   * MÉTODO PARA INICIALIZAR EL OBJETO DE LOS HORIZON-MATERIAL-BUTTONS:
   */
  private initButtons() {
    this.matButtons = [
      {
        action: ACTION_TYPES.nextStep,
        icon: this.nextBtnIcon,
        customIcon: this.initStream,
        class: 'animated-btn-h animated-btn-static ' + this.nextBtnColor,
        appearance: this.btnAppearance
      },
      {
        action: ACTION_TYPES.prevStep,
        icon: 'chevron-left',
        class: 'animated-btn-h ' + this.prevBtnColor
      },
      {
        action: ACTION_TYPES.close,
        icon: 'close',
      }
    ];
  }

  /**
   * MÉTODO PARA OBTENER LA CAUSA DEL RECLAMO, MEDIANTE EVENT EMITTER:
   */
  public getSelectCause(event: string) {
    this.selectedCause = event;
    if (this.aceptedTerms) {
      this.aceptedTerms = false;
      this.btnAppearance = BTN_APPAREANCE.light;
      this.initButtons();
    }
  }

  /**
   * MÉTODO PARA OBTENER SI EL USUARIO ACEPTA O NO LOS TÉRMINOS:
   */
  public getAceptTerms(event: boolean) {
    this.aceptedTerms = event;
    this.btnAppearance = event ? BTN_APPAREANCE.normal : BTN_APPAREANCE.light;
    this.initButtons();
  }

  /**
   * MÉTODO PARA DESLIZAR EN PRIMER PLANO LA SIGUIENTES INTERFACES DEL WIZARD:
   */
  private nextPrevStep(next: boolean) {
    let nextPrevElement, lastElement;

    if (next) {
      nextPrevElement = $("#newClaimContainer .personal-carousel.next").first();
      nextPrevElement.removeClass("next").prevAll().first().addClass("prev");

      this.btnAppearance = BTN_APPAREANCE.light;
      this.prevBtnColor = event ? this.prevBtnColor + ' animated-btn-static animate-in' : '';

      if (nextPrevElement.attr("id") == "customPub") {
        this.nextBtnIcon = 'check';
      }

      this.initButtons();
    } else {
      nextPrevElement = $("#newClaimContainer .personal-carousel.prev").last();
      lastElement = nextPrevElement.nextAll().first();
      lastElement.addClass("next");
      setTimeout(() => {
        nextPrevElement.removeClass("prev");
      }, 100);

      this.btnAppearance = BTN_APPAREANCE.normal;

      if (nextPrevElement.attr("id") == "firstClaimStep") {
        this.prevBtnColor = '';
        this.initButtons();
      }
      else if (nextPrevElement.attr("id") == "claimDetail") {
        this.nextBtnIcon = 'chevron-right';
        this.initStream = false;
        this.initButtons();
      }

    }
    this.defineAnimation(next);
  }

  /**
   * METODO PAR ESTABLECER LA ANIMACION DE APERTURA DE INTERFAZ
   */
  private defineAnimation(next: boolean) {
    setTimeout(() => {
      if (next) {
        this.currentStep++;
      }
      else {
        this.currentStep--;
      }
    }, 1000);
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.nextStep:
        switch (this.currentStep) {
          case 0:
            if (this.aceptedTerms) {
              this.nextPrevStep(true);
            }
            else {
              Snackbar.show({ text: "Lea y acepte los términos y condiciones", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });
            }
            break;
          case 1:
            if (this.btnAppearance == BTN_APPAREANCE.normal) {
              this.nextPrevStep(true);
            }
            else {
              Snackbar.show({ text: "Por favor registre toda la información solicitada", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });
            }
            break;
          case 2:
            if (this.btnAppearance == BTN_APPAREANCE.normal) {
              setTimeout(() => {
                this.reqSubmit = null;
              });
              if (this.initStream) {
                this.reqSubmit = ACTION_TYPES.pubStream;
              }
              else {
                this.reqSubmit = ACTION_TYPES.submitPub;
              }
            }
            else {
              Snackbar.show({ text: "Por favor registre toda la información solicitada", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });
            }
            break;
        }
        break;
      case ACTION_TYPES.prevStep:
        this.nextPrevStep(false);
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * MÉTODO PARA CERRAR EL MODAL PADRE, SOLICITADO DESDE UN COMPONENTE HIJO
   */
  close(event: boolean) {
    if (event) {
      this.closeModal.emit(true);
    }
  }

  /**
   * MÉTODO PARA DETECTAR EL CAMBIO DE PUB NORMAL A PUB DE STREAMING:
   */
  public oInitStream(event: boolean) {
    if (event) {
      this.nextBtnIcon = 'f';
    }
    else {
      this.nextBtnIcon = 'check';
    }
    this.initStream = event;
    this.initButtons();
  }

  /**
   * METODO PARA OBTENER LOS DATOS DE LA QUEJA EERSA
   * @param event VALOR DEL EVENT EMITTER QUE LLEGA DESDE EL COMPONENTE HIJO CLAIM DETAL
   */
  public getEersaLocClient(event: { eersaClient: EersaClient; eersaLocation: EersaLocation; }) {
    this.eersaLocClient = event;
    if (this.eersaLocClient.eersaLocation.idBarrio != 0 && this.eersaLocClient.eersaLocation.referencia) {
      if (this.btnAppearance == BTN_APPAREANCE.light) {
        this.btnAppearance = BTN_APPAREANCE.normal;
        this.initButtons();
      }
    }
    else if (this.btnAppearance == BTN_APPAREANCE.normal) {
      this.btnAppearance = BTN_APPAREANCE.light;
      this.initButtons();
    }
  }

  /**
   * METODO PARA DETECTAR QUE EL FORMULARIO DE QUEJA/RECLAMO ES VÁLIDO
   * @param event VALOR QUE VIENE DEL OBJETO EVENT EMITTER:
   */
  public onValidForm(event: boolean) {
    if (event) {
      if (this.btnAppearance == BTN_APPAREANCE.light) {
        this.btnAppearance = BTN_APPAREANCE.normal;
        this.initButtons();
      }
    }
    else {
      if (this.btnAppearance == BTN_APPAREANCE.normal) {
        this.btnAppearance = BTN_APPAREANCE.light;
        this.initButtons();
      }
    }
  }

}
