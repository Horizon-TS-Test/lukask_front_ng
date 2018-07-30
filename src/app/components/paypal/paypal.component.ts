import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.css']
})
export class PaypalComponent implements OnInit {
  @Input() showClass: string;
  @Output() closeModal: EventEmitter<boolean>;
  @Input() paypalUrl: string;

  public url: any;
  public matButtons: HorizonButton[];

  constructor(
    public sanitizer: DomSanitizer
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.paypalUrl);
  }

}
