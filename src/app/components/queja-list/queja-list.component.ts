import { Component, OnInit, OnDestroy, EventEmitter, Output, AfterViewInit } from '@angular/core';

import { QuejaService } from '../../services/queja.service';
import { Publication } from '../../models/publications';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';
import { ACTION_TYPES } from '../../config/action-types';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { DateManager } from '../../tools/date-manager';
import { IntroData } from '../../interfaces/intro-data.interface';
import IntroDataInterface from '../../data/intro-data';
import { SliderManager } from '../../tools/slider-manger';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { ContentService } from '../../services/content.service';

declare var $: any;
@Component({
  selector: 'app-quejas-list',
  templateUrl: './queja-list.component.html',
  styleUrls: ['./queja-list.component.css'],
})
export class QuejaListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() actionType = new EventEmitter<DynaContent>();
  private _sliderManager: SliderManager;

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private subscriptor: Subscription;
  public styles: any;
  public IntroList: IntroData[];
  public pubList: Publication[];
  public mainLoadingClass: string;
  public mainActiveClass: string;
  public activeClass: string;
  public introDataList: IntroData[];

  constructor(
    private _contentService: ContentService,
    private _domSanitizer: DomSanitizer,
    private _quejaService: QuejaService,
    private _notifierService: NotifierService
  ) {
    this.pubList = [];
    this.introDataList = IntroDataInterface;
    /**
     * SUBSCRIPCIÓN PARA CAPTAR EL LLAMADO DEL COMPONENTE INICIO QUIEN SOLICITA 
     * LA CARGA DE MAS COMPONENTES AL LLEGAR EL SCROLL DEL USUARIO AL FINAL DE LA PÁGINA
     */
    this.subscriptor = this._notifierService._morePubsRequest.subscribe((morePubs) => {
      if (morePubs) {
        this.getMorePubs();
      }
    });
    /*** */
  }

  ngOnInit() {
    this.loadingAnimation();
    this.defineImageStyle();
  }
  ngAfterViewInit() {
    let slider = $("#Intro").find(".cd-hero-slider");
    let navPause = $("#Intro").find(".personal-pause");
    let navPlay = $("#Intro").find(".personal-play");
    this._sliderManager = new SliderManager(slider, navPause, navPlay);
    setTimeout(() => {
      this.getPubList();
    }, 2000);
  }

  /**
   * MÉTODO PARA DEFINIR EL STILO USANDO URL'S SEGURAS PARA LAS IMÁGENES DEL SLIDER:
   */
  defineImageStyle() {
    this.styles = [];
    //REF: https://angular.io/guide/security#xss
    for (let intro of this.introDataList) {
      this.styles.push(this._domSanitizer.bypassSecurityTrustStyle("url(" + intro.image + ")"));
    }
  }

  /**
   * MÉTODO PARA ACTIVAR EL EECTO DE CARGANDO:
   */
  private loadingAnimation(hide: boolean = false) {
    if (hide) {
      this.mainLoadingClass = "";
      this.mainActiveClass = "";
    }
    else {
      this.mainLoadingClass = "on";
      this.mainActiveClass = "active";
    }
  }

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  getPubList() {
    this._quejaService.getPubList().then((pubs: Publication[]) => {
      this.pubList = pubs;
      this.activeClass = this.LOADER_HIDE;
      this.loadingAnimation(true);
    }).catch(err => {
      console.log(err);
      this.activeClass = this.LOADER_HIDE;
      this.loadingAnimation(true);
    });
  }

  /**
   * FUNCIÓN PARA OBTENER PUBLICACIONES BAJO DEMANDA A TRAVÉS DE UN PATTERN DE PAGINACIÓN:
   */
  getMorePubs() {
    if (this.pubList && this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      this._quejaService.getMorePubs().then((morePubs: Publication[]) => {
        setTimeout(() => {
          this.activeClass = "";

          setTimeout(() => {
            this.activeClass = this.LOADER_HIDE;
            this.pubList = morePubs;
          }, 800);

        }, 1000);
      }).catch(err => {
        console.log(err);

        setTimeout(() => {
          this.activeClass = "";

          setTimeout(() => {
            this.activeClass = this.LOADER_HIDE;
          }, 800);

        }, 1000)
      });
    }
  }

  /**
   * MÉTODO PARA CAPTAR LA ACCIÓN DE ALGÚN BOTÓN DEL LA LISTA DE BOTONES, COMPONENTE HIJO
   * @param $event VALOR DEL TIPO DE ACCIÓN QUE VIENE EN UN EVENT-EMITTER
   */
  optionButtonAction(event: number, pubId: string) {
    if (event === ACTION_TYPES.mapFocus) {
      this.actionType.emit({ contentType: event, contentData: pubId });
    }
  }
  nextPrev(event: any, next: boolean) {
    event.preventDefault();
    this._sliderManager.goPrevNext(next);
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}