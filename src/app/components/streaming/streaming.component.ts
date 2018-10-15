import { Component, OnInit } from '@angular/core';
import { ContentService } from 'src/app/services/content.service';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-streaming',
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.css']
})
export class StreamingComponent implements OnInit {
  public pubId: string;
  public ownerId: string;
  public showClass;

  constructor(
    private _contentService: ContentService,
    private _activatedRoute: ActivatedRoute
  ) {
    this.showClass = "show";
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#streamingContainer"));
    this.getQueryParams();
  }

  /**
   * MÉTODO PARA OBTENER LOS PARÁMETROS QUE LLEGAN EN EL URL:
   */
  private getQueryParams() {
    this._activatedRoute.queryParams.subscribe(params => {
      this.pubId = params['pub'];
      this.ownerId = params['owner'];
    });
  }

}
