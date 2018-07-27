import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { PaymentsService } from '../../services/payments.service';
import { Payment } from '../../models/payments';
import { Alert } from '../../models/alert';
import { NotifierService } from '../../services/notifier.service';
import { ALERT_TYPES } from '../../config/alert-types';
import { CONTENT_TYPES } from '../../config/content-type';



declare var $: any;


@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;
  @Input() pagos: Payment;
  private _CLOSE = 1;
  public matButtons: HorizonButton[];
  private alertData: Alert;

  constructor(
    private _payments: PaymentsService,
    private _notifierService: NotifierService

  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        action: this._CLOSE,
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
    this._payments.postPagosClient(this.pagos).then((data) => {
      console.log("[LA URL QUE ENVIA PAYPAL PARA CANCELAR]", data);
      this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.paypal, contentData: data.data.data });
    }, (err) => {
      console.log("[CUANDO NOS DA UN ERROR DEL SERVIDOR]", err);
      this.alertData = new Alert({ title: "DISCULPAS LOS ERRORES", message: "ESTAMOS TRABAJANDO EN ELLOS", type: ALERT_TYPES.danger });
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
     * 
     * @param err CUANDO EL SERVIDOR NO RESPONDE O DAMOS MAL LOS DATOS
     */

  envioPagosCard(event: any, pagos: any) {
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.card, contentData: pagos });
  }

  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }


}
