import { Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { FormBuilder } from '@angular/forms';
import { Pagos } from '../../interfaces/planillas-data';
import planillasData from '../../data/planillas-data';


declare var $: any;

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;
  @Input() pagos: Pagos[];
  private _SUBMIT = 0;
  private _CLOSE = 1;
  private self: any;
  public matButtons: HorizonButton[];

  constructor(
    private formBuilder: FormBuilder
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
    alert("Pagos Para enviar");
  }
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._SUBMIT:
      //LLamado a paypal  
      this.envioPagos();
        break;
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }


}
