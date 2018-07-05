import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

declare var $: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  private self: any;
  public focusPubId: string;
  public focusComId: string;
  public focusRepId: string;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getQueryParams();
    this.self = $("#local-content-1");
    this._contentService.fadeInComponent();
    this.focusInnerOption();

    this.self.scroll(() => {
      if (this._contentService.isBottomScroll(this.self)) {
        this._notifierService.notifyMorePubsRequest(true);
      }
    });
  }

  /**
   * MÉTODO PARA OBTENER LOS PARÁMETROS QUE LLEGAN EN EL URL:
   */
  getQueryParams() {
    this._activatedRoute.queryParams.subscribe(params => {
      this.focusPubId = params['pubId'];
      this.focusComId = params['comId'];
      this.focusRepId = params['repId'];
    });
  }

  /**
   * MÉTODO PARA DAR FOCUS A LA OPCIÓN ASOCIADA A ESTE CONTENIDO PRINCIPAL DE NAVEGACIÓN:
   */
  focusInnerOption() {
    this._contentService.focusMenuOption($("#id-top-panel"), "top-option-0");
  }
}
