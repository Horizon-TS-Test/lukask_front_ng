import { Component, OnInit, Input } from '@angular/core';
import { Queja } from '../../interfaces/queja.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { Publication } from '../../models/publications';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';

@Component({
  selector: 'app-queja',
  templateUrl: './queja.component.html',
  styleUrls: ['./queja.component.css']
})
export class QuejaComponent implements OnInit {
  @Input() queja: Publication;

  constructor(
    public _domSanitizer: DomSanitizer,
    public _notifierService: NotifierService
  ) { }

  ngOnInit() {
  }

  viewQuejaDetail(event: any, idPub) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: idPub});
  }

}
