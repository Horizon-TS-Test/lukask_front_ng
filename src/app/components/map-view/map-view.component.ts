import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit {
  public lat: number;
  public lng: number;
  public zoom: number;

  constructor(
    private _contentService: ContentService
  ) {
    this.lat = -1.6709800;
    this.lng = -78.6471200;
    this.zoom = 16;
  }

  ngOnInit() {
    this._contentService.fadeInComponent();
  }

}
