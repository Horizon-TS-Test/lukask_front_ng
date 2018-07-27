import { Component, OnInit } from '@angular/core';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';


@Component({
  selector: 'app-pagos-inicio',
  templateUrl: './pagos-inicio.component.html',
  styleUrls: ['./pagos-inicio.component.css']
})
export class PagosInicioComponent implements OnInit {

  constructor(
    private _notifierService: NotifierService,
     ) { }

  ngOnInit() {
  }

    /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL
   * PARA LA PAGINA DE INICICO DE PAGOS
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
   **/
  openLayer(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.pagos_busq, contentData: "" });
  }

}
