import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../models/card';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import cardData from '../../data/card-data';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Alert } from '../../models/alert';
import { PaymentsService } from '../../services/payments.service';
import { Payment } from '../../models/payments';
import { Router } from '@angular/router';
import { ALERT_TYPES } from '../../config/alert-types';
import { User } from '../../models/user';


@Component({
  selector: 'app-payments-card',
  templateUrl: './payments-card.component.html',
  styleUrls: ['./payments-card.component.css']
})
export class PaymentsCardComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;
  @Input() card: Card;
  @Input() pagos: Payment;
  public contentTypes: any;
  private _SUBMIT = 0;
  private _CLOSE = 1;
  private self: any;
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
        parentContentType: 0,
        action: this._SUBMIT,
        icon: "check"
      },
      {
        parentContentType: 0,
        action: this._CLOSE,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
  }

  envioPagosTarjeta(pagos: any) {
    console.log("Entrara al error");
    this._payments.postPagosCards(pagos, this.card).then((data) => {
      const mensaje = "CONSUMIDOR:" + data.data.data.email;
      console.log("Dataaa", mensaje);
      this.alertData = new Alert({ title: "SU PAGO SE FUE EXITOSO", message: mensaje, type: ALERT_TYPES.success });
      this.setAlert();
      this.closeModal.emit(true);
      this.card = null;
    }, (err) => {
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
