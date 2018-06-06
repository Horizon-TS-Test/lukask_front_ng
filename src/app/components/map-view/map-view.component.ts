import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { ViewChild } from '@angular/core';
import { } from '@types/googlemaps';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import pubIcons from '../../data/pub-icons';
import pubIconsOver from '../../data/pub-icons-over';
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
  //map: google.maps.Map;
  map: any;
  listaPosiciones: any[];
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
    this.listaPosiciones = [
      { lat: -1.663585, lng: -78.658242 },
      { lat: -1.665846, lng: -78.649935 },
      { lat: -1.672766, lng: -78.654561 },
      { lat: -1.672800, lng: -78.642033 },
      { lat: -1.680462, lng: -78.642911 }
    ];

  }

  ngOnInit() {
    this._contentService.fadeInComponent();
    var mapProp = {
      center: new google.maps.LatLng(-1.669685, -78.651953),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: this.estilo
    };


    //Definicion del mapa
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.getPubs();

    $("#idviewPub").on(("click"), (event) => {
      console.log("si das cluck")
      //event.preventDefault();
      //this.viewPub();
    });

    //TOMANDO QUERY PARAMS:
    this.getQueryParams();
    ////
    //HACIENDO FOCUS UNA PUBLICACIÓN EN EL MAPA
    //this.metodFocusPubId();
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
   * METODO QUE VALIDA SI HAY UN ID DEL MARKER
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
   * Funcion para cambiar de icono cuando el mouse se encuentre encima
   * */
  defineTypeIconOver(typeId) {
    for (let typeIconOver of pubIconsOver) {
      if (typeIconOver.type_id == typeId.id) {
        return typeIconOver.icon;
      }
    }
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
   * Funcion para crear marker en el mapa
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

    //Definicion de un evento del marker
    var infowindow = new google.maps.InfoWindow({
      content: description
    });

    marker.addListener('click', (event) => {
      this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: pubId });
      $("#idviewPub").click(); //No tocar si no deja de funcionar ojo!!     
      //infowindow.open(this.map, marker);
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
      this.metodFocusPubId();
    });
  }

  estilo = [
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e9e9e9"
        },
        {
          "lightness": 17
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        },
        {
          "lightness": 20
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "lightness": 17
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "lightness": 29
        },
        {
          "weight": 0.2
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "lightness": 18
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "lightness": 16
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        },
        {
          "lightness": 21
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dedede"
        },
        {
          "lightness": 21
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "color": "#ffffff"
        },
        {
          "lightness": 16
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "saturation": 36
        },
        {
          "color": "#333333"
        },
        {
          "lightness": 40
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f2f2f2"
        },
        {
          "lightness": 19
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#fefefe"
        },
        {
          "lightness": 20
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#fefefe"
        },
        {
          "lightness": 17
        },
        {
          "weight": 1.2
        }
      ]
    }
  ];

}
