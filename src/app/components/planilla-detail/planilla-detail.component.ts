import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { PaymentsService } from '../../services/payments.service';
import { Alert } from '../../models/alert';
import { NotifierService } from '../../services/notifier.service';
import { ALERT_TYPES } from '../../config/alert-types';
import { CONTENT_TYPES } from '../../config/content-type';
import { Planilla } from '../../interfaces/planilla-interface';
import { ACTION_TYPES } from '../../config/action-types';

@Component({
  selector: 'planilla-detail',
  templateUrl: './planilla-detail.component.html',
  styleUrls: ['./planilla-detail.component.css']
})
export class PlanillaDetailComponent implements OnInit {
  @Input() planilla: Planilla;
  @Input() showClass: string;
  @Output() closeModal: EventEmitter<boolean>;

  private alertData: Alert;

  public matButtons: HorizonButton[];
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private _payments: PaymentsService,
    private _notifierService: NotifierService

  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ];
  }

  ngOnInit() { }

  /**
     * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL 
     * PARA VER LA PAGINA DE PAYPAL PARA CONSUMIR
     * @param err CUANDO EL SERVIDOR NO RESPONDE O DAMOS MAL LOS DATOS
     */
  envioPagos() {
    this.loadingClass = "on";
    this.activeClass = "active";
    this.showClass = "";
    this._payments.postPagosClient(this.planilla).then((data) => {
      console.log("[LA URL QUE ENVIA PAYPAL PARA CANCELAR]", data);
      this.closeModal.emit(true);
      this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.paypal, contentData: data.data.data });
    }, (err) => {
      console.log("[CUANDO NOS DA UN ERROR DEL SERVIDOR]", err);
      this.loadingClass = "";
      this.activeClass = "";

      this.alertData = new Alert({ title: "Error de Conexión", message: "Sentimos los inconvenientes, estamos trabajando para mejorar tu experiencia de usuario.", type: ALERT_TYPES.danger });
      this.setAlert();
      this.closeModal.emit(true);
    });
  }

  /**
   * MÉTODO PARA LLAMAR A LA ALERTA
   * @param alertData EL TIPO DE ERROR QUE VAMOS A DAR
   */
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL 
   * PARA VER LA PAGINA DE PAYPAL PARA CONSUMIR POR TARJETA DE CREDITO
   * @param err CUANDO EL SERVIDOR NO RESPONDE O DAMOS MAL LOS DATOS
  */
  envioPagosCard(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.payment_card, contentData: this.planilla });
  }

  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

}
