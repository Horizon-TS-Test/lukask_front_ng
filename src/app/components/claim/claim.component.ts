import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';

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
  private animateClass: string;

  public matButtons: HorizonButton[];
  public loadingClass: string;
  public activeClass: string;
  public transmitStyle: string;
  public selectedCause: string;
  public showPub: boolean;

  constructor() {
    this.aceptedTerms = false;
    this.showPub = false;
    this.animateClass = 'animate-in';
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
        class: 'animated-btn-h ' + this.animateClass
      },
      {
        action: ACTION_TYPES.prevStep,
        icon: 'chevron-left',
        class: 'animated-btn-h'
      },
      {
        action: ACTION_TYPES.close,
        icon: 'close',
        class: 'animated-btn-h' + this.animateClass
      }
    ];
  }

  /**
   * MÉTODO PARA OBTENER LA CAUSA DEL RECLAMO, MEDIANTE EVENT EMITTER:
   */
  public getSelectCause(event: string) {
    this.selectedCause = event;
  }

  /**
   * MÉTODO PARA OBTENER SI EL USUARIO ACEPTA O NO LOS TÉRMINOS:
   */
  public getAceptTerms(event: boolean) {
    this.aceptedTerms = event;
  }

  /**
   * MÉTODO PARA DESLIZAR EN PRIMER PLANO LA SIGUIENTES INTERFACES DEL WIZARD:
   */
  private nextPrevStep(next: boolean) {
    let counter = 0;
    $(".personal-carousel").each((index, element) => {
      if (counter < 1) {
        if (next) {
          if ($(element).hasClass("next")) {
            if ($(element).attr("id") == "customPub") {
              this.showPub = true;
              this.animateClass = '';
              this.initButtons();
            }
            counter++;
            $(element).removeClass("next").prevAll().first().addClass("prev");
          }
        }
        else {
          if ($(element).hasClass("prev")) {
            counter++;
            $(element).removeClass("prev").nextAll().first().addClass("next");
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
          console.log("Acepte los términos primero");
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
