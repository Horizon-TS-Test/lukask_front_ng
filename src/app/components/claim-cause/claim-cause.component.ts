import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HorizonSwitchInputInterface } from '../../interfaces/horizon-switch-in.interface';
import { ClaimCauseInterface } from '../../interfaces/cause-claim.interface';
import causeClaim from '../../data/cause-claim';

@Component({
  selector: 'claim-cause',
  templateUrl: './claim-cause.component.html',
  styleUrls: ['./claim-cause.component.css']
})
export class ClaimCauseComponent implements OnInit {
  @Output() onSelectCause: EventEmitter<string>;
  @Output() onAceptTerms: EventEmitter<boolean>;

  public switchIns: HorizonSwitchInputInterface[];
  public claimCauses: ClaimCauseInterface[];
  public aceptedTerms: boolean;
  public selectedCause: string;

  constructor() {
    this.aceptedTerms = false;
    this.onSelectCause = new EventEmitter<string>();
    this.onAceptTerms = new EventEmitter<boolean>();
  }

  ngOnInit() {
    this.claimCauses = causeClaim;
    this.initSwitchInputs();
    this.selectedCause = this.claimCauses[0].causeId;
    this.onSelectCause.emit(this.selectedCause);
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
    this.onAceptTerms.emit(this.aceptedTerms);
  }

  /**
   * MÉTODO PARA CAPTURAR LA CAUSA DEL RECLAMO ESCOGIDO POR EL USUARIO:
   * @param event ID QUE VIENE POR EL OUTPUT EVENT EMITTER DEL COMPONENTE HIJO
   */
  public getSelectedClainCause(event: string) {
    this.selectedCause = event;
    this.onSelectCause.emit(event);
  }
}
