import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Publication } from '../../models/publications';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { ActionService } from '../../services/action.service';

@Component({
  selector: 'app-queja',
  templateUrl: './queja.component.html',
  styleUrls: ['./queja.component.css'],
  providers: [ActionService]
})
export class QuejaComponent implements OnInit {
  @Input() queja: Publication;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _notifierService: NotifierService
  ) { }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA VER EL DETALLE DE UNA QUEJA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  viewQuejaDetail(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: this.queja.id_publication });
  }

}
