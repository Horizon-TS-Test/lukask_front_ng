import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { ViewChild } from '@angular/core';
import { } from '@types/googlemaps';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import pubIcons from '../../data/pub-icons';

declare var google: any;

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  providers: [QuejaService]
})
export class MapViewComponent implements OnInit {
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
    private _quejaService: QuejaService
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
  }

  saluda() {
    alert("Saludando...!");
  }

  defineTypeIcon(typeId) {
    for (let typeIcon of pubIcons) {
      if (typeIcon.type_id == typeId) {
        return typeIcon.icon;
      }
    }
  }

  recorer() {
    console.log("Recorrer....");
    console.log("List: ", this.pubList);
    for (let pub of this.pubList) {
      console.log(pub.latitude);
      this.crearMarker(pub.latitude, pub.longitude, this.defineTypeIcon(pub.type));
    }
  }

  crearMarker(lat, lng, icon) {

    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: this.map,
      title: 'Got you!',
      icon: icon,
      draggable: false
    });

    //Definicion de un evento del marker
    var infowindow = new google.maps.InfoWindow({
      content: "Baches"
    });

    marker.addListener('click', () => {
      this.saluda();
      infowindow.open(this.map, marker);
    });
  }

  getPubs() {
    this._quejaService.getPubList().then((pubs: Publication[]) => {
      this.pubList = pubs;
      this.recorer();
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
