import { Component, OnInit, OnDestroy } from '@angular/core';

import { QuejaService } from '../../services/queja.service';
import { Publication } from '../../models/publications';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user';
import { REST_SERV } from '../../rest-url/rest-servers';
import { Media } from '../../models/media';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';

declare var $: any;
declare var writeData: any;
declare var deleteItemData: any;

@Component({
  selector: 'app-quejas-list',
  templateUrl: './queja-list.component.html',
  styleUrls: ['./queja-list.component.css'],
})
export class QuejaListComponent implements OnInit, OnDestroy {
  private subscriptor: Subscription
  public pubList: Publication[];

  constructor(
    private _quejaService: QuejaService,
    private _socketService: SocketService,
    private _contentService: ContentService,
    private _notifierService: NotifierService
  ) {
    this.getPubList();

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

  ngOnInit() { }

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  getPubList() {
    this._quejaService.getPubList().then((pubs: Publication[]) => {
      this.pubList = pubs;
    }).catch(err => {
      console.log(err);
    });
  }

  /**
   * FUNCIÓN PARA OBTENER PUBLICACIONES BAJO DEMANDA A TRAVÉS DE UN PATTERN DE PAGINACIÓN:
   */
  getMorePubs() {
    if (!$(".bottom-loader").hasClass("on")) {
      $(".bottom-loader").addClass("on");
      this._quejaService.getMorePubs().then((morePubs: Publication[]) => {
        setTimeout(() => {
          $(".bottom-loader").removeClass("on");
          this.pubList = morePubs;
        }, 1500)
      }).catch(err => {
        console.log(err);

        setTimeout(() => {
          $(".bottom-loader").removeClass("on");
        }, 1500)
      });
    }
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}