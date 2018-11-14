import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
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
  
  public aceptedTerms: boolean;
  public matButtons: HorizonButton[];
  public loadingClass: string;
  public activeClass: string;
  public transmitStyle: string;
  public selectedCause: string;
  public currentStep: number;
  public reqSubmit: number;

  constructor() {
    this.currentStep = 0;
    this.aceptedTerms = false;
    this.initStream = false;
    this.prevBtnColor = '';
    this.transmitStyle = "secondary";
    this.nextBtnColor = 'animate-in';
    this.nextBtnIcon = 'chevron-right';
  }

  ngOnInit() {
    this.initButtons();
  }

  /**
   * MÉTODO PARA INICIALIZAR EL OBJETO DE LOS HORIZON-MATERIAL-BUTTONS:
   */
  initButtons() {
    this.matButtons = [
      {
        action: ACTION_TYPES.nextStep,
        icon: this.nextBtnIcon,
        customIcon: this.initStream,
        class: 'animated-btn-h animated-btn-static ' + this.nextBtnColor
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
      this.nextBtnColor = ' animate-in';
      this.initButtons();
    }
  }

  /**
   * MÉTODO PARA OBTENER SI EL USUARIO ACEPTA O NO LOS TÉRMINOS:
   */
  public getAceptTerms(event: boolean) {
    this.aceptedTerms = event;
    this.nextBtnColor = event ? this.nextBtnColor + ' custom-btn-normal' : ' animate-in';
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

      this.prevBtnColor = event ? this.prevBtnColor + ' animated-btn-static animate-in' : '';
      this.initButtons();
      this.currentStep++;

      if (nextPrevElement.attr("id") == "customPub") {
        this.nextBtnIcon = 'check';
        this.initButtons();
      }
    } else {
      nextPrevElement = $("#newClaimContainer .personal-carousel.prev").last();
      lastElement = nextPrevElement.removeClass("prev").nextAll().first();
      lastElement.addClass("next");

      if (nextPrevElement.attr("id") == "firstClaimStep") {
        this.prevBtnColor = '';
        this.initButtons();
      }
      else if (nextPrevElement.attr("id") == "claimDetail") {
        this.nextBtnColor = this.nextBtnColor + ' custom-btn-normal';
        this.nextBtnIcon = 'chevron-right';
        this.initStream = false;
        this.initButtons();
      }

      this.currentStep--;
    }
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
            this.nextPrevStep(true);
            break;
          case 2:
            setTimeout(() => {
              this.reqSubmit = null;
            });
            if (this.initStream) {
              this.reqSubmit = ACTION_TYPES.pubStream;
            }
            else {
              this.reqSubmit = ACTION_TYPES.submitPub;
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

}
