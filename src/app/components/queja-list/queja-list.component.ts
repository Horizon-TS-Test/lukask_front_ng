import { Component, OnInit, OnDestroy, EventEmitter, Output, AfterViewInit } from '@angular/core';

import { QuejaService } from '../../services/queja.service';
import { Publication } from '../../models/publications';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';
import { ACTION_TYPES } from '../../config/action-types';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { DateManager } from '../../tools/date-manager';

@Component({
  selector: 'app-quejas-list',
  templateUrl: './queja-list.component.html',
  styleUrls: ['./queja-list.component.css'],
})
export class QuejaListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() actionType = new EventEmitter<DynaContent>();

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private subscriptor: Subscription

  public pubList: Publication[];
  public mainLoadingClass: string;
  public mainActiveClass: string;
  public activeClass: string;

  constructor(
    private _quejaService: QuejaService,
    private _notifierService: NotifierService
  ) {
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
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getPubList();
    }, 2000);
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

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}