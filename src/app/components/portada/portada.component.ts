import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';

declare var device: any;

@Component({
  selector: 'app-portada',
  templateUrl: './portada.component.html',
  styleUrls: ['./portada.component.css']
})
export class PortadaComponent implements OnInit {
  public isNative: boolean;

  constructor(
    private _contentService: ContentService
  ) { }

  ngOnInit() {
    this.isNativeApp();
  }

  /**
   * METODO PARA DETECTAR SI EL APP ESTA DESPLEGADA EN FORMA DE APP MOVIL NATIVA:
   */
  private isNativeApp() {
    document.addEventListener("deviceready", () => {
      this.isNative = device.platform ? true : false;
    }, false);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._contentService.hidePortada();
    }, 2500);
  }

}
