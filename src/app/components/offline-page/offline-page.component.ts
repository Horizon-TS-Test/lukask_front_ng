import { Component, OnInit } from '@angular/core';
import { ContentService } from 'src/app/services/content.service';
import { DomSanitizer } from '@angular/platform-browser';

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
    this.img = _domSanitizer.bypassSecurityTrustUrl("assets/images/offline/offline2.jpg");
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#offlineContent"));
  }

  /**
   * MÉTODO PARA REDIRECCIONAR A LA PÁGINA PRINCIPAL:
   * @param event 
   */
  public goToHome(event: any) {
    event.preventDefault();
    location.href = "/"
  }

}
