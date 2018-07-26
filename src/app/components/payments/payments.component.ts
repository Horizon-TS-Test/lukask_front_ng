import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { FormBuilder } from '@angular/forms';
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
  private self: any;
  public matButtons: HorizonButton[];
  private alertData: Alert;

  constructor(
    private _payments: PaymentsService,
    private _notifierService: NotifierService

  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        parentContentType: 0,
        action: this._CLOSE,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    this.self = $("#personal-payments-q");
    $("#hidden-btn").on(("click"), (event) => { }); //NO TOCAR!
  }

  //Envio para los Pagos PayPal
  envioPagos() {
    this._payments.postPagosClient(this.pagos).then((data) => {
       this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.paypal, contentData: data.data.data });
    }, (err) => {
      this.alertData = new Alert({ title: "DISCULPAS LOS ERRORES", message: "ESTAMOS TRABAJANDO EN ELLOS", type: ALERT_TYPES.danger });
      this.setAlert();
      this.closeModal.emit(true);
    });


  }
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  //Envio para los Pagos

  envioPagosCard(event: any, pagos: any) {
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.card, contentData: pagos });
  }
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      /*case this._SUBMIT:
        this.envioPagos();
        break;*/
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }


}
