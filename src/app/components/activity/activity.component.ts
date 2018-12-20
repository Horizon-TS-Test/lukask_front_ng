import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ContentService } from '../../services/content.service';

declare var $: any;

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit, AfterViewInit {
  private _BACK = 1;

  public focusPubId: string;
  public focusComId: string;
  public focusRepId: string;
  public matButtons: HorizonButton[];
  public isOffline: boolean;

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _contentService: ContentService
  ) {
    this.isOffline = navigator.onLine == false;

    if (!this.isOffline) {
      this.matButtons = [
        {
          action: this._BACK,
          icon: 'chevron-left',
          class: 'custom-btn-normal'
        }
      ];
    }
  }

  ngOnInit() {
    this.getQueryParams();
  }

  ngAfterViewInit() {
    this._contentService.fadeInComponent($("#actContainer"));
  }

  /**
   * METODO PARA OBTENER LOS PARÁMETROS QUE LLEGAN EN EL URL:
   */
  getQueryParams() {
    this._activatedRoute.queryParams.subscribe(params => {
      this.focusPubId = params['pubId'];
      this.focusComId = params['comId'];
      this.focusRepId = params['repId'];
    });
  }

  /**
   * METODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._BACK:
        this._router.navigate(['/']);
        break;
    }
  }

}
