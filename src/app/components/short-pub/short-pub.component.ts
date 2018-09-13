import { Component, OnInit, Input } from '@angular/core';
import { Publication } from '../../models/publications';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';

@Component({
  selector: 'short-pub',
  templateUrl: './short-pub.component.html',
  styleUrls: ['./short-pub.component.css']
})
export class ShortPubComponent implements OnInit {
  @Input() pub: Publication;

  constructor(
    private _notifierService: NotifierService
  ) { }

  ngOnInit() { }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA VER EL DETALLE DE UNA QUEJA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  viewQuejaDetail(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: this.pub.id_publication });
  }
}
