import { Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { FormBuilder } from '@angular/forms';
import { PaymentsService } from '../../services/payments.service';
import { Payment } from '../../models/payments';


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

  constructor(
    private formBuilder: FormBuilder,
    private _payments: PaymentsService
  ) { 
    this.closeModal = new EventEmitter<boolean>();
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
    this.self = $("#personal-payments-q");
    $("#hidden-btn").on(("click"), (event) => { }); //NO TOCAR!
  }

  //Envio para los Pagos
  envioPagos () {
    this._payments.postPagosClient(this.pagos);
  }
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._SUBMIT:
        this.envioPagos();
        break;
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }


}
