import { Component, OnInit, ViewChild } from '@angular/core';
import styleMap from '../../data/map-style';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Publication } from '../../models/publications';
import pubIcons from '../../data/pub-icons';

declare var google: any;

@Component({
  selector: 'single-map',
  templateUrl: './single-map.component.html',
  styleUrls: ['./single-map.component.css']
})
export class SingleMapComponent implements OnInit {
  @ViewChild('gmap') gmapElement: any;
  private map: any;

  public _ref: any;
  public _dynaContent: DynaContent;
  public zoom: number;
  public quejaDetail: Publication;

  constructor() {
    this.zoom = 16;
  }

  ngOnInit() {
    this.quejaDetail = <Publication>this._dynaContent.contentData;
    this.defineMap();
  }

  /**
   * METODO PARA DEFINIR LAS PROPIEDADES Y APARIENCI DEL MAPA:
   */
  defineMap() {
    var mapProp = {
      center: new google.maps.LatLng(this.quejaDetail.latitude, this.quejaDetail.longitude),
      zoom: this.zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styleMap,
      disableDefaultUI: true
    };

    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.crearMarker(this.quejaDetail.latitude, this.quejaDetail.longitude, this.defineTypeIcon(this.quejaDetail.type.description));
  }

  /**
   * METODO PARA CREAR EL MARKER EN EL MAPA
   * @param lat = latitud
   * @param lng = longitud
   * @param icon = icono
   */
  crearMarker(lat: number, lng: number, icon: string) {
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: this.map,
      icon: icon,
      draggable: false
    });
  }

  /**
   * METODO QUE SEGUN EL TIPO DE ENTIDAD ENVIA EL ICONO
   * @param typeId = TIPO DE ENTIDAD
   */
  defineTypeIcon(typeId) {
    for (let typeIcon of pubIcons) {
      if (typeIcon.type_id == typeId) {
        return typeIcon.icon;
      }
    }
  }

}
