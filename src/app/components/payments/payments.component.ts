import { Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { FormBuilder } from '@angular/forms';
import { PaymentsService } from '../../services/payments.service';
import { Payment } from '../../models/payments';
import { Alert } from '../../models/alert';
import { NotifierService } from '../../services/notifier.service';
import { ALERT_TYPES } from '../../config/alert-types';


declare var $: any;

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;
  @Input() pagos: Payment;
  private _SUBMIT = 0;
  private _CLOSE = 1;
  private self: any;
  public matButtons: HorizonButton[];
  private alertData: Alert;
  

  constructor(
    private formBuilder: FormBuilder,
    private _payments: PaymentsService,
    private _notifierService: NotifierService,
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
  envioPagosPayPal () {
    console.log(this.pagos);
    this._payments.postPagosClient(this.pagos).then((data) => {
      document.location.href = data.data.data;
      /*LLamar al get con alert
      this.alertData = new Alert({ title: 'Proceso Correcto', message: data.data, type: ALERT_TYPES.success });
      this.setAlert();*/
    });
  }
   //Envio para los Pagos
   envioPagosCard () {
    this._payments.postPagosCards(this.pagos).then((data) => {
      document.location.href = data.data.data;
      /*LLamar al get con alert
      this.alertData = new Alert({ title: 'Proceso Correcto', message: data.data, type: ALERT_TYPES.success });
      this.setAlert();*/
    });
  }
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
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
