import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import cardData from '../../data/card-data';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Alert } from '../../models/alert';
import { PaymentsService } from '../../services/payments.service';
import { Payment } from '../../models/payments';
import { Router } from '@angular/router';
import { ALERT_TYPES } from '../../config/alert-types';
import { CreditCard } from '../../interfaces/credit-card';

@Component({
  selector: 'app-payments-card',
  templateUrl: './payments-card.component.html',
  styleUrls: ['./payments-card.component.css']
})
export class PaymentsCardComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;
  @Input() card: CreditCard;
  @Input() pagos: Payment;

  public contentTypes: any;
  private _SUBMIT = 0;
  private _CLOSE = 1;

  public matButtons: HorizonButton[];
  private alertData: Alert;
  constructor(
    private _payments: PaymentsService,
    private _notifierService: NotifierService,
    private _router: Router
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.contentTypes = CONTENT_TYPES;
    this.card = cardData;
    this.matButtons = [
      {
        action: this._SUBMIT,
        icon: "check"
      },
      {
        action: this._CLOSE,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
  }

  envioPagosTarjeta(pagos: any) {
    console.log("[DATOS PAGOS]",pagos);
    console.log("[DATOS TARJETA]",this.card);
     this._payments.postPagosCards(pagos, this.card).then((data) => {
      console.log("[DATOS DE RESPUESTA DE PAYPAL A PAGAR]",data);
      const mensaje = "CONSUMIDOR:" + data.data.data.email;
       this.alertData = new Alert({ title: "SU PAGO SE FUE EXITOSO", message: mensaje, type: ALERT_TYPES.success });
      this.setAlert();
      this.closeModal.emit(true);
      this.card = null;
    }, (err) => {
      console.log("[ERROR DE LA RESPUESTA A PAGAR]",err);
      this.alertData = new Alert({ title: "DATOS ERRONEOS DE LA TARJETA", message: "VERIFIQUE SUS DATOS", type: ALERT_TYPES.danger});
      this.setAlert();
      this.closeModal.emit(true);
    });
  }

  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._SUBMIT:
        this.envioPagosTarjeta(this.pagos);
        break;
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

}
