import { Component, OnInit, EventEmitter, Output, AfterViewInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';

import { QuejaService } from '../../services/queja.service';
import { Publication } from '../../models/publications';
import { Subscription } from 'rxjs';
import { ACTION_TYPES } from '../../config/action-types';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { IntroData } from '../../interfaces/intro-data.interface';
import IntroDataInterface from '../../data/intro-data';
import { SliderManager } from '../../tools/slider-manger';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { DynamicPubsService } from 'src/app/services/dynamic-pubs.service';

declare var $: any;
@Component({
  selector: 'app-quejas-list',
  templateUrl: './queja-list.component.html',
  styleUrls: ['./queja-list.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class QuejaListComponent implements OnInit {
  @Output() actionType = new EventEmitter<DynaContent>();
  private _sliderManager: SliderManager;

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  public subscriptor: Subscription;
  public subMorePubs: Subscription;
  public styles: any;
  public activeClass: string;
  public introDataList: IntroData[];

  constructor(
    private _domSanitizer: DomSanitizer,
    private _quejaService: QuejaService,
    private _dynamicPubsService: DynamicPubsService
  ) {
    this.introDataList = IntroDataInterface;

    this.subMorePubs = this._dynamicPubsService.morePubs$.subscribe((morePubs) => {
      if (morePubs) {
        this.waitingForMorePubs();
      }
    });

    /**
     * PARA DETECTAR LA CARGA DE MAS PUBLICACIONES:
     */
    this.subscriptor = this._quejaService.pubs$.subscribe((morePubs) => {
      if (!morePubs) {
        this.defineSlider();
      }
      this.morePubsHasCome();
    });
    /*** */
  }

  ngOnInit() {
    this.defineImageStyle();
  }

  private defineSlider() {
    let slider = $("#Intro").find(".cd-hero-slider");
    let navPause = $("#Intro").find(".personal-pause");
    let navPlay = $("#Intro").find(".personal-play");
    this._sliderManager = new SliderManager(slider, navPause, navPlay);
  }

  /**
   * MÉTODO PARA DEFINIR EL STILO USANDO URL'S SEGURAS PARA LAS IMÁGENES DEL SLIDER:
   */
  private defineImageStyle() {
    this.styles = [];
    //REF: https://angular.io/guide/security#xss
    for (let intro of this.introDataList) {
      this.styles.push(this._domSanitizer.bypassSecurityTrustStyle("url(" + intro.image + ")"));
    }
  }

  /**
   * FUNCIÓN PARA OBTENER PUBLICACIONES BAJO DEMANDA A TRAVÉS DE UN PATTERN DE PAGINACIÓN:
   */
  private waitingForMorePubs() {
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
    }
  }

  /**
   * MÉTODO PARA QUITAR EL ESTILO DE CARGANDO UEV
   */
  private morePubsHasCome() {
    this.activeClass = "";

    setTimeout(() => {
      this.activeClass = this.LOADER_HIDE;
    }, 800);
  }

  /**
   * MÉTODO PARA CAPTAR LA ACCIÓN DE ALGÚN BOTÓN DEL LA LISTA DE BOTONES, COMPONENTE HIJO
   * @param $event VALOR DEL TIPO DE ACCIÓN QUE VIENE EN UN EVENT-EMITTER
   */
  public optionButtonAction(event: number, pubId: string) {
    if (event === ACTION_TYPES.mapFocus) {
      this.actionType.emit({ contentType: event, contentData: pubId });
    }
  }

  /**
   * MÉTODO PARA NAVEGAR E INTERACTUAR CON EL SLIDER:
   * @param event 
   * @param next 
   */
  public nextPrev(event: any, next: boolean) {
    event.preventDefault();
    this._sliderManager.goPrevNext(next);
  }

  /**
   * MÉTODO PARA CANCELAR EL ENVIO DE UNA PUB OFFLINE:
   * @param $event 
   */
  public cancelPub(pub: Publication) {
    this._quejaService.deleteOfflinePub(pub);
  }
}