import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { QuejaService } from '../../services/queja.service';
import { NotifierService } from '../../services/notifier.service';
import { ActionService } from '../../services/action.service';

declare var $: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  private self: any;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService
  ) {
  }

  ngOnInit() {
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
   * MÉTODO PARA DAR FOCUS A LA OPCIÓN ASOCIADA A ESTE CONTENIDO PRINCIPAL DE NAVEGACIÓN:
   */
  focusInnerOption() {
    this._contentService.focusMenuOption($("#id-top-panel"), "top-option-0");
  }
}
