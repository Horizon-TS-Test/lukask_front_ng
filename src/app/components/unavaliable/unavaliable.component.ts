import { Component, OnInit } from '@angular/core';
import { ContentService } from 'src/app/services/content.service';
import { DomSanitizer } from '@angular/platform-browser';

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
    this.img = _domSanitizer.bypassSecurityTrustUrl("assets/images/unavaliable/not-found2.jpg");
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#unavaliableContent"));
  }
}
