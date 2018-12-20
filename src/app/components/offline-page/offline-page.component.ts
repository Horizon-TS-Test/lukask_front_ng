import { Component, OnInit } from '@angular/core';
import { ContentService } from 'src/app/services/content.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ASSETS } from 'src/app/config/assets-url';

declare var $: any;

@Component({
  selector: 'offline-page',
  templateUrl: './offline-page.component.html',
  styleUrls: ['./offline-page.component.css']
})
export class OfflinePageComponent implements OnInit {
  public img: any;

  constructor(
    private _contentService: ContentService,
    private _domSanitizer: DomSanitizer
  ) {
    this.img = _domSanitizer.bypassSecurityTrustUrl(ASSETS.offlineImg);
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#offlineContent"));
  }

  /**
   * METODO PARA REDIRECCIONAR A LA PÁGINA PRINCIPAL:
   * @param event 
   */
  public goToHome(event: any) {
    event.preventDefault();
    location.href = "/"
  }

}
