import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Publication } from '../../models/publications';
import { CONTENT_TYPES } from '../../config/content-type';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { ACTION_TYPES } from 'src/app/config/action-types';

@Component({
  selector: 'short-pub',
  templateUrl: './short-pub.component.html',
  styleUrls: ['./short-pub.component.css']
})
export class ShortPubComponent implements OnInit {
  @Input() pub: Publication;
  @Output() geoMap = new EventEmitter<number>();

  constructor(
    private _dynaContentService: DynaContentService
  ) { }

  ngOnInit() {
    this.makeDetailShorter();
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA VER EL DETALLE DE UNA QUEJA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public viewQuejaDetail(event: any) {
    event.preventDefault();
    this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.view_queja, contentData: this.pub.id_publication });
  }

  /**
   * METODO PARA MOSTRAR LA QUEJA EN EL MAPA:
   * @param $event 
   */
  public geolocatePub(event: any) {
    event.preventDefault();
    this.geoMap.emit(ACTION_TYPES.mapFocus);
  }

  /**
   * METODO PARA ACORTAR EL TEXTO DEL DETALLE DE LA QUEJA:
   */
  private makeDetailShorter() {
    if (this.pub.detail.length > 110) {
      this.pub.detail = this.pub.detail.substring(0, 110) + " ...";
    }
  }
}
