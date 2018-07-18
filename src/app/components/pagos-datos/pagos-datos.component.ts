import { Component, OnInit, Input, OnDestroy, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { Payment } from '../../models/payments';


@Component({
  selector: 'app-pagos-datos',
  templateUrl: './pagos-datos.component.html',
  styleUrls: ['./pagos-datos.component.css']
})
export class PagosDatosComponent implements OnInit {
  @Input() pagos: Payment;
  public contentTypes: any;

  constructor(
    private _notifierService: NotifierService
  ) {
    this.contentTypes = CONTENT_TYPES;
  }

  ngOnInit() {
  }
  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA VER EL DETALLE DE UNA QUEJA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  viewPagosDetail (event: any, contType: number, pagos: any) {
    event.preventDefault();
    console.log("ciiiiiiiii");
    //console.log(pagos.ci);
    console.log(pagos);
    this._notifierService.notifyNewContent({ contentType: contType, contentData: pagos });
  }
}
