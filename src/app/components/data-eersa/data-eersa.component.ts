import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Planilla } from '../../interfaces/planilla-interface';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Alert } from '../../models/alert';
import { NotifierService } from '../../services/notifier.service';
import { ACTION_TYPES } from '../../config/action-types';


@Component({
  selector: 'app-data-eersa',
  templateUrl: './data-eersa.component.html',
  styleUrls: ['./data-eersa.component.css']
})
export class DataEersaComponent implements OnInit {
  @Input() planilla: Planilla;
  @Input() showClass: string;
  @Output() closeModal: EventEmitter<boolean>;

  private alertData: Alert;

  public matButtons: HorizonButton[];
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private _notifierService: NotifierService
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        action: ACTION_TYPES.dataEERSA,
        icon: "check"
      },
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
  }

  /**
 * MÉTODO PARA LLAMAR A LA ALERTA
 * @param alertData EL TIPO DE ERROR QUE VAMOS A DAR
 */
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.dataEERSA:
        this.closeModal.emit(true);
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

}
