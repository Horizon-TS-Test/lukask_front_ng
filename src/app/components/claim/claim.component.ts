import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { HorizonSwitchInputInterface } from '../../interfaces/horizon-switch-in.interface';
import { ClaimCauseInterface } from '../../interfaces/cause-claim.interface';
import causeClaim from '../../data/cause-claim';
import { $ } from 'protractor';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})
export class ClaimComponent implements OnInit {
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<boolean>();

  
  public matButtons: HorizonButton[];
  public switchIns: HorizonSwitchInputInterface[];
  public loadingClass: string;
  public activeClass: string;
  public transmitStyle: string;
  public selectedCause: string;
  public claimCauses: ClaimCauseInterface[];
  public aceptedTerms: boolean;

  constructor() {
    this.aceptedTerms = false;

    this.transmitStyle = "secondary";

    this.matButtons = [
      {
        action: ACTION_TYPES.nextStep,
        icon: 'chevron-right',
        class: 'animated-btn-h animate-in'
      },
      {
        action: ACTION_TYPES.prevStep,
        icon: 'chevron-left',
        class: 'animated-btn-h'
      },
      {
        action: ACTION_TYPES.close,
        icon: 'close'
      }
    ];
  }

  ngOnInit() {
    this.claimCauses = causeClaim;
    this.initSwitchInputs();
    this.selectedCause = this.claimCauses[0].causeId;
  }

  /**
   * MÉTODO PARA DEFINIR EL ARRAY DE TIPO HORIZON-SWITCH-INPUT:
   */
  private initSwitchInputs() {
    this.switchIns = [];
    for (let i = 0; i < this.claimCauses.length; i++) {
      this.switchIns[i] = {
        id: this.claimCauses[i].causeId,
        label: this.claimCauses[i].description,
        checked: (i == 0) ? true : false,
        immutable: true,
        customClass: 'switch-normal'
      }
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public aceptTerms(event: any) {
    this.aceptedTerms = !this.aceptedTerms;
  }

  /**
   * MÉTODO PARA CAPTURAR LA CAUSA DEL RECLAMO ESCOGIDO POR EL USUARIO:
   * @param event ID QUE VIENE POR EL OUTPUT EVENT EMITTER DEL COMPONENTE HIJO
   */
  public getSelectedClainCause(event: string) {
    this.selectedCause = event;
  }

  /**
   * MÉTODO PARA DESLIZAR EN PRIMER PLANO LA SIGUIENTES INTERFACES DEL WIZARD:
   */
  private nextPrevStep(next: boolean) {
    if (next) {
      $(".personal-carousel").find(".next").removeClass("next").prevAll().first().addClass("prev");
    }
    else {
      $(".personal-carousel").find(".prev").removeClass("prev").nextAll().first().addClass("next");
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.nextStep:
        this.nextPrevStep(true);
        break;
      case ACTION_TYPES.prevStep:
        this.nextPrevStep(false);
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

}
