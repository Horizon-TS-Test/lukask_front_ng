import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.css']
})
export class PaypalComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;
  @Input() paypalUrl: string;
  public url: any;
  constructor(
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.paypalUrl);
  }

 

}
