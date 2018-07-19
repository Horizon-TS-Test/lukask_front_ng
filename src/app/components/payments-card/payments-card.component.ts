import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../models/card';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import cardData from '../../data/card-data';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Alert } from '../../models/alert';
import { PaymentsService } from '../../services/payments.service';


@Component({
  selector: 'app-payments-card',
  templateUrl: './payments-card.component.html',
  styleUrls: ['./payments-card.component.css']
})
export class PaymentsCardComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;
  @Input() card: Card;
  public contentTypes: any;
  private _SUBMIT = 0;
  private _CLOSE = 1;
  private self: any;
  public matButtons: HorizonButton[];
  private alertData: Alert;
  constructor(
    private _payments: PaymentsService,
    private _notifierService: NotifierService
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

  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._SUBMIT:
        //this.envioPagos();
        break;
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

}
