import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Publication } from '../../models/publications';
import { CONTENT_TYPES } from '../../config/content-type';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { ACTION_TYPES } from 'src/app/config/action-types';
import { DomSanitizer } from '@angular/platform-browser';
import { ASSETS } from 'src/app/config/assets-url';
import { Media } from 'src/app/models/media';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'short-pub',
  templateUrl: './short-pub.component.html',
  styleUrls: ['./short-pub.component.css']
})
export class ShortPubComponent implements OnInit {
  @Input() pub: Publication;
  @Output() geoMap: EventEmitter<number>;
  @Output() onCancelPub: EventEmitter<Publication>;

  public isAdmin: boolean;

  constructor(
    private _dynaContentService: DynaContentService,
    public _domSanitizer: DomSanitizer,
    public _userService: UserService
  ) {
    this.verifyIsAdmin();
    this.geoMap = new EventEmitter<number>();
    this.onCancelPub = new EventEmitter<Publication>();
  }

  ngOnInit() {
    this.setDefaultImg();
    this.makeDetailShorter();
  }

  /**
   * METODO PARA ESCUCHAR SI EL USUARIO LOGEADO ES O NO UN ADMINSTRADOR:
   */
  private verifyIsAdmin() {
    this._userService.isAdmin$.subscribe((admin: boolean) => {
      this.isAdmin = admin;
    });
  }

  /**
   * METODO PARA DEFINIR UNA IMAGEN POR DEFECTO EN CASO DE QUE EL RECLAMO OFFLINE NO TENGA MEDIOS:
   */
  private setDefaultImg() {
    if (this.pub.media.length == 0) {
      this.pub.media[0] = new Media(null, null, ASSETS.defaultImg);;
    }
  }

  /**
   * METODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA VER EL DETALLE DE UNA QUEJA:
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

  /**
   * METODO PARA CANCELAR UN RECLAMO OFFLINE:
   * @param event 
   */
  public cancelPub(event: any) {
    event.preventDefault();
    this.onCancelPub.emit(this.pub);
  }
}
