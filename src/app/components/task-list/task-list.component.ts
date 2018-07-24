import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ActionService } from '../../services/action.service';
import { Publication } from '../../models/publications';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { ACTION_TYPES } from '../../config/action-types';

declare var $: any;

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  @Input() queja: Publication;
  @Input() isModal: boolean;
  @Output() actionType = new EventEmitter<number>();

  constructor(
    private _actionService: ActionService,
    private _contentService: ContentService,
    private _notifierService: NotifierService
  ) { }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA DAR RELEVANCIA A UNA PUBLICACIÓN Y ENVIARLA AL BACKEND:
   * @param event 
   */
  onRelevance(event: any) {
    event.preventDefault();
    this._actionService.saveRelevance(this.queja.id_publication, !this.queja.user_relevance)
      .then((active: boolean) => {
        if (active) {
          this.queja.user_relevance = active;
          this.queja.relevance_counter += 1;
        }
        else {
          this.queja.user_relevance = active;
          this.queja.relevance_counter -= 1;
        }
      })
      .catch((error) => console.log(error));
  }

  /**
   * MÉTODO PARA GEOLOCALIZAR LA QUEJA SELECCIONADA
   */
  geolocatePub(event: any) {
    event.preventDefault();
    if (this.isModal == true) {
      this._contentService.elementScrollInside($(".horizon-modal"), $("#sigle-map").offset().top);
    }
    else {
      //REF:https://github.com/angular/angular/issues/18798#soulfresh
      /*this._router.navigateByUrl(
        this._router.createUrlTree(
          ['/mapview'],
          {
            queryParams: {
              pubId: this.queja.id_publication
            }
          }
        )
      );*/
      this.actionType.emit(ACTION_TYPES.mapFocus);
    }
  }

  /**
   * MÉTODO PARA ABRIR LA TRANSMISIÓN DE UNA PUBLICACIÓN:
   * @param event 
   */
  viewTransmission(event: any) {
    event.preventDefault();
    if (!this.queja.transDone) {
      this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_transmission, contentData: { userOwner: this.queja.user.id, pubId: this.queja.id_publication } });
    }
  }

  /**
   * MÉTODO PARA ABRIR UN MODAL CON LA LISTA DE PERSONAS QUE APOYAN LA PUBLICACIÓN:
   * @param event 
   */
  viewSupport(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.support_list, contentData: { pubId: this.queja.id_publication, pubOwner: this.queja.user.person.name } });
  }

}
