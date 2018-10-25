import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { ViewChild } from '@angular/core';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import pubIcons from '../../data/pub-icons';
import pubIconsOver from '../../data/pub-icons-over';
import styleMap from '../../data/map-style';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { DynaContentService } from 'src/app/services/dyna-content.service';

declare var google: any;
declare var $: any;

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit, OnChanges {
  @Input() focusPubId: string;

  public lat: number;
  public lng: number;
  public zoom: number;

  public subscription: Subscription;

  @ViewChild('gmap') gmapElement: any;
  map: any;
  public pubList: Publication[];

  constructor(
    private _contentService: ContentService,
    private _quejaService: QuejaService,
    private _dynaContentService: DynaContentService,
  ) {
    this.lat = -1.6709800;
    this.lng = -78.6471200;
    this.zoom = 15;
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#mapContainer"));
    this.getGps()
    var mapProp = {
      center: new google.maps.LatLng(this.lat, this.lng),
      zoom: this.zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styleMap
    };

    /**
     * PARA SUBSCRIBIRSE AL EVENTO DE ACTUALIZACIÓN DEL SOCKET, QUE TRAE 
     * LOS CAMBIOS DE UNA PUBLICACIÓN PARA LUEGO MOSTRARLA EN EL MAPA
    */
    this.subscription = this._quejaService._mapEmitter.subscribe((newPubId: string) => {
      this.fetchPub();
      this.focusPubId = newPubId;
      this.focusPubById();
    });
    ////

    //Definición del mapa
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.getPubs();

    /**
     * MÉTODO QUE EJECUTA LA ACCIÓN DEL MARKER
     */
    $("#idviewPub").on(("click"), (event) => { });
  }

  /**
   * MÉTODO QUE OBTIENE LA POSICIÓN DESDE DONDE SE EMITE LA QUEJA
   */
  private getGps() {
    if (!('geolocation' in navigator)) {
      return;
    }

    //ACCESS TO THE GPS:
    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;

    }, function (err) {
      console.log(err);
      //EXCEDED THE TIMEOUT
      return;
    }, { timeout: 7000 });
  }

  /**
   * MÉTODO QUE RECORRE LA LISTA DE QUEJAS Y CREA EL MARKER DE CADA UNA
   */
  private fetchPub() {
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
  private crearMarker(lat, lng, icon, pubId: string, pubtype, description) {
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
      this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.view_queja, contentData: pubId });
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

  private getPubs() {
    this.pubList = this._quejaService.getPubListObj();
    if (!this.pubList) {
      this._quejaService.getPubList().then((pubs: Publication[]) => {
        this.pubList = pubs;
        this.fetchPub();
        if (!this.focusPubId) {
          this.focusPubId = this.pubList[0].id_publication;
        }
        //HACIENDO FOCUS UNA PUBLICACIÓN EN EL MAPA      
        this.focusPubById();
      });
    }
    else {
      this.fetchPub();
      if (!this.focusPubId) {
        this.focusPubId = this.pubList[0].id_publication;
      }
      //HACIENDO FOCUS UNA PUBLICACIÓN EN EL MAPA      
      this.focusPubById();
    }
  }

  /**
   * METODO QUE VALIDA SI HAY UN ID DE QUEJA PARA UBICARLO EN EL MAPA
   */
  private focusPubById() {
    if (this.focusPubId) {
      let focusZoom = 15;
      for (let i = 0; i < this.pubList.length; i++) {
        if (this.focusPubId == this.pubList[i].id_publication) {
          this.map.setCenter({ lat: this.pubList[i].latitude, lng: this.pubList[i].longitude });
          this.map.setZoom(focusZoom);
          i = this.pubList.length;
        }
      }
    }
  }

  /**
   * METODO QUE SEGUN EL TIPO DE ENTIDAD ENVIA EL ICONO
   * @param typeId = TIPO DE ENTIDAD
   */
  private defineTypeIcon(typeId) {
    for (let typeIcon of pubIcons) {
      if (typeIcon.type_id == typeId.description) {
        return typeIcon.icon;
      }
    }
  }

  /**
   * MÉTODO PARA CAMBIAR DE ICONO CUANDO EL MOUSE SE ENCUENTRE ENCIMA
   * @param typeId = Identificador del marker en el que el mouse se encuentra encima 
   * */
  private defineTypeIconOver(typeId) {
    for (let typeIconOver of pubIconsOver) {
      if (typeIconOver.type_id == typeId.description) {
        return typeIconOver.icon;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      /*console.log('Previous:', changes[property].previousValue);
      console.log('Current:', changes[property].currentValue);
      console.log('firstChange:', changes[property].firstChange);*/

      if (property === 'focusPubId') {
        if (changes[property].currentValue) {
          this.focusPubId = changes[property].currentValue;
          if (this.pubList) {
            this.focusPubById();
          }
        }
      }
    }
  }
}
