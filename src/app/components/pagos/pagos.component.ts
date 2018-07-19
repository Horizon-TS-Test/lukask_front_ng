import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';

declare var $: any;
@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {

  constructor(
    private _contentService: ContentService
  ) { }

  ngOnInit() {
    this._contentService.fadeInComponent($("#pagos-paypal"));
  }
}
