import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CONTENT_TYPES } from '../../config/content-type';
import { PaymentsIntro } from '../../interfaces/payments-intro.interface';
import PaymentsIntroData from '../../data/payments-intro';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { ContentService } from '../../services/content.service';
import { SliderManager } from '../../tools/slider-manger';
import { DynaContentService } from 'src/app/services/dyna-content.service';

declare var $: any;
@Component({
  selector: 'app-pagos-inicio',
  templateUrl: './pagos-inicio.component.html',
  styleUrls: ['./pagos-inicio.component.css']
})
export class PagosInicioComponent implements OnInit, AfterViewInit {

  private _sliderManager: SliderManager;

  public styles: any;
  public payIntroList: PaymentsIntro[];

  constructor(
    private _dynaContentService: DynaContentService,
    private _domSanitizer: DomSanitizer,
    private _contentService: ContentService
  ) {
    this.payIntroList = PaymentsIntroData;
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#pagosIntro"));
    this.defineImageStyle();
  }

  ngAfterViewInit() {
    let slider = $("#pagosIntro").find(".cd-hero-slider");
    let navPause = $("#pagosIntro").find(".personal-pause");
    let navPlay = $("#pagosIntro").find(".personal-play");
    this._sliderManager = new SliderManager(slider, navPause, navPlay);
  }

  /**
   * METODO PARA DEFINIR EL STILO USANDO URL'S SEGURAS PARA LAS IMÁGENES DEL SLIDER:
   */
  private defineImageStyle() {
    this.styles = [];
    //REF: https://angular.io/guide/security#xss
    for (let intro of this.payIntroList) {
      this.styles.push(this._domSanitizer.bypassSecurityTrustStyle("url(" + intro.image + ")"));
    }
  }

  /**
 * METODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL
 * PARA LA PAGINA DE INICIO DE PAGOS
 * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
 * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
 **/
  public openLayer(event: any) {
    event.preventDefault();
    this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.find_accounts, contentData: "" });
  }

  public nextPrev(event: any, next: boolean) {
    event.preventDefault();
    this._sliderManager.goPrevNext(next);
  }
  /**
   * METODO PARA PAUSAR O REANUDAR EL SLIDER
   * @param event 
   * @param pause 
   */
  public playPause(event: any, pause: boolean) {
    event.preventDefault();
    this._sliderManager.playPause(pause);
  }
}
