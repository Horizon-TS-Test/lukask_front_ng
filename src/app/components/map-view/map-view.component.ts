import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { ViewChild } from '@angular/core';
import { } from '@types/googlemaps';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import pubIcons from '../../data/pub-icons';
import pubIconsOver from '../../data/pub-icons-over';
import styleMap from '../../data/map-style';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { ActivatedRoute } from '@angular/router';


declare var google: any;
declare var $: any;

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  providers: [QuejaService]
})
export class MapViewComponent implements OnInit {
  private focusPubId: string;

  public lat: number;
  public lng: number;
  public zoom: number;

  @ViewChild('gmap') gmapElement: any;
  map: any; 
  public pubList: Publication[];

  constructor(
    private _contentService: ContentService,
    private _quejaService: QuejaService,
    private _notifierService: NotifierService,
    private _activatedRoute: ActivatedRoute,
  ) {
    this.lat = -1.6709800;
    this.lng = -78.6471200;
    this.zoom = 19;
  }

  ngOnInit() {
    this._contentService.fadeInComponent();
    var mapProp = {
      center: new google.maps.LatLng(-1.669685, -78.651953),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styleMap
    };

    //Definición del mapa
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.getPubs();

    /**
     * MÉTODO QUE EJECUTA LA ACCIÓN DEL MARKER
     */
    $("#idviewPub").on(("click"), (event) => { });

    //TOMANDO QUERY PARAMS:
    this.getQueryParams();
  }

  /**
   * MÉTODO PARA OBTENER LOS PARÁMETROS QUE LLEGAN EN EL URL:
   */
  getQueryParams() {
    this._activatedRoute.queryParams.subscribe(params => {
      this.focusPubId = params['pubId'];
    });
  }

/**
 * METODO QUE RECORRE LA LISTA DE QUEJAS Y CREA EL MARKER DE CADA UNA
 */
  recorer() {
    for (let pub of this.pubList) {
      this.crearMarker(pub.latitude, pub.longitude, this.defineTypeIcon(pub.type), pub.id_publication, pub.type, pub.type.description);
    }
  }

  /**
   * MÉTODO PARA CREAR EL MARKER EN EL MAPA
   * @param lat = latitud
   * @param lng = longitud
   * @param icon = icono
   * @param pubId = identificador de la publicacion
   * @param pubtype = tipo de queja
   * @param description = nombre de la entidad
   */
  crearMarker(lat, lng, icon, pubId: string, pubtype, description) {
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: this.map,
      title: description,
      icon: icon,
      draggable: false
    });

    var infowindow = new google.maps.InfoWindow({
      content: description
    });

    marker.addListener('click', (event) => {
      this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: pubId });
      $("#idviewPub").click(); //No tocar si no deja de funcionar ojo!!     
    });

    marker.addListener('mouseover', () => {
      let icon = this.defineTypeIconOver(pubtype);
      marker.setIcon(icon);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      infowindow.open(this.map, marker);
    });

    marker.addListener('mouseout', () => {
      let icon = this.defineTypeIcon(pubtype);
      marker.setIcon(icon);
      marker.setAnimation();
      infowindow.close(this.map, marker);
    });
  }

  viewPub(pubId: string = "02ceab07-d0d3-4073-86ba-654534813f86") {
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: pubId });
  }

  getPubs() {
    this._quejaService.getPubList().then((pubs: Publication[]) => {
      this.pubList = pubs;
      this.recorer();
      //HACIENDO FOCUS UNA PUBLICACIÓN EN EL MAPA      
      this.metodFocusPubId();
    });
  }
  
  /**
   * METODO QUE VALIDA SI HAY UN ID DE QUEJA PARA UBICARLO EN EL MAPA
   */
  metodFocusPubId() {
    if (this.focusPubId != undefined) {
      this.focus();
    } 
  }

  /**
   * METODO QUE ENFOCA EL MARKER BUSCADO
   */
  focus() {
    for (let pub of this.pubList) {
      if (this.focusPubId == pub.id_publication) {
        this.map.setCenter({ lat: pub.latitude, lng: pub.longitude });
        this.map.setZoom(19);
      }
    }
  }

  /**
   * METODO QUE SEGUN EL TIPO DE ENTIDAD ENVIA EL ICONO
   * @param typeId = TIPO DE ENTIDAD
   */
  defineTypeIcon(typeId) {
    for (let typeIcon of pubIcons) {
      if (typeIcon.type_id == typeId.id) {
        return typeIcon.icon;
      }
    }
  }

  /**
   * MÉTODO PARA CAMBIAR DE ICONO CUANDO EL MOUSE SE ENCUENTRE ENCIMA
   * @param typeId = Identificador del marker en el que el mouse se encuentra encima 
   * */
  defineTypeIconOver(typeId) {
    for (let typeIconOver of pubIconsOver) {
      if (typeIconOver.type_id == typeId.id) {
        return typeIconOver.icon;
      }
    }
  }

}
