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

  private aceptedTerms: boolean;
  private nextBtnColor: string;
  private prevBtnColor: string;

  public matButtons: HorizonButton[];
  public loadingClass: string;
  public activeClass: string;
  public transmitStyle: string;
  public selectedCause: string;
  public showPub: boolean;
  public currentStep: number;

  constructor() {
    this.currentStep = 0;
    this.aceptedTerms = false;
    this.showPub = false;
    this.nextBtnColor = 'animate-in';
    this.prevBtnColor = '';
    this.transmitStyle = "secondary";
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
        icon: 'chevron-right',
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
    let counter = 0;
    $("#newClaimContainer .personal-carousel").each((index, element) => {
      if (counter < 1) {
        if (next) {
          if ($(element).hasClass("next")) {
            if ($(element).attr("id") == "customPub") {
              this.showPub = true;
            }
            counter++;
            $(element).removeClass("next").prevAll().first().addClass("prev");

            this.prevBtnColor = event ? this.prevBtnColor + ' animated-btn-static animate-in' : '';
            this.initButtons();
            this.currentStep++;
          }
        }
        else {
          if ($(element).hasClass("prev")) {
            if ($(element).attr("id") == "firstClaimStep") {
              this.prevBtnColor = '';
              this.initButtons();
            }
            counter++;

            $(element).removeClass("prev").nextAll().first().addClass("next");
            this.currentStep--;
          }
        }
      }
    });
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.nextStep:
        if (this.aceptedTerms) {
          this.nextPrevStep(true);
        }
        else {
          Snackbar.show({ text: "Lea y acepte los términos y condiciones", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });
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

}
