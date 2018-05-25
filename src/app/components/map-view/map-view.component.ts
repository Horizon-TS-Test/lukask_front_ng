import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { ViewChild } from '@angular/core';
import { } from '@types/googlemaps';

declare var google:any;

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit {
  public lat: number;
  public lng: number;
  public zoom: number;
	
	@ViewChild('gmap') gmapElement: any;
	map: google.maps.Map;

  constructor(
    private _contentService: ContentService
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
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  
    //Definicion del mapa
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

  }

}
