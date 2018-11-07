import { Component, OnInit } from '@angular/core';
import { ContentService } from 'src/app/services/content.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ASSETS } from 'src/app/config/assets-url';

declare var $: any;

@Component({
  selector: 'unavaliable',
  templateUrl: './unavaliable.component.html',
  styleUrls: ['./unavaliable.component.css']
})
export class UnavaliableComponent implements OnInit {
  public img: any;

  constructor(
    private _contentService: ContentService,
    private _domSanitizer: DomSanitizer
  ) {
    this.img = _domSanitizer.bypassSecurityTrustUrl(ASSETS.unavaliableImg);
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#unavaliableContent"));
  }
}
