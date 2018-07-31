import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotifierService } from '../../services/notifier.service';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Alert } from '../../models/alert';
import { PaymentsService } from '../../services/payments.service';
import { ALERT_TYPES } from '../../config/alert-types';
import { Planilla } from '../../interfaces/planilla-interface';
import { ACTION_TYPES } from '../../config/action-types';
import { PaymentCard } from '../../models/payment-card';

@Component({
  selector: 'payments-card',
  templateUrl: './payments-card.component.html',
  styleUrls: ['./payments-card.component.css']
})
export class PaymentsCardComponent implements OnInit {
  @Input() planilla: Planilla;
  @Output() closePop: EventEmitter<boolean>;

  private _SUBMIT = 0;

  public paymentCard: PaymentCard;
  public matButtons: HorizonButton[];
  private alertData: Alert;
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private _paymentsService: PaymentsService,
    private _notifierService: NotifierService
  ) {
    this.closePop = new EventEmitter<boolean>();
    this.initPayObj();

    this.matButtons = [
      {
        action: this._SUBMIT,
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

  initPayObj() {
    this.paymentCard = new PaymentCard('', '', '', '', '');
  }

  /**
   * MÉTODO PARA ACTIVAR EL EECTO DE CARGANDO:
   */
  private loadingAnimation() {
    this.loadingClass = "on";
    this.activeClass = "active";
  }

  /**
   * MÉTODO PARA CAPTAR EL EVENTO CLICK DEL BOTON DEL COMPONENTE PARA PAGAR CON TARJETA
   * @param event
   */
  payWithCard(event: any, isValidForm: boolean) {
    event.preventDefault();
    if (isValidForm) {
      console.log("[DATOS PAGOS]", this.planilla);
      console.log("[DATOS TARJETA]", this.paymentCard);

      this.loadingAnimation();
      this._paymentsService.postPagosCards(this.planilla, this.paymentCard).then((data) => {
        console.log("[DATOS DE RESPUESTA DE PAYPAL A PAGAR]", data);
        const mensaje = "CONSUMIDOR:" + data.data.data.email;
        this.alertData = new Alert({ title: "SU PAGO SE FUE EXITOSO", message: mensaje, type: ALERT_TYPES.success });
        this.setAlert();
        this.closePop.emit(true);
      }, (err) => {
        console.log("[ERROR DE LA RESPUESTA A PAGAR]", err);
        this.alertData = new Alert({ title: "DATOS ERRONEOS DE LA TARJETA", message: "VERIFIQUE SUS DATOS", type: ALERT_TYPES.danger });
        this.setAlert();
        this.closePop.emit(true);
      });
    }
  }

  /**
   * MÉTODO PARA 
   */
  requestClosePop(event: any) {
    event.preventDefault();
    this.closePop.emit(true);
  }

  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }
}
