import { Component, OnInit, Input } from '@angular/core';
import { ActionService } from '../../services/action.service';
import { Publication } from '../../models/publications';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';

declare var $: any;

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  @Input() queja: Publication;
  @Input() isModal: boolean;

  constructor(
    private _actionService: ActionService,
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _router: Router
  ) { }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA DAR RELEVANCIA A UNA PUBLICACIÓN Y ENVIARLA AL BACKEND:
   * @param event 
   */
  onRelevance(event: any) {
    event.preventDefault();
    this._actionService.sendRelevance(this.queja.id_publication, !this.queja.user_relevance)
      .then((active: boolean) => {
        if (active) {
          this.queja.user_relevance = active;
        }
        else {
          this.queja.user_relevance = active;
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
      this._router.navigateByUrl(
        this._router.createUrlTree(
          ['/mapview'],
          {
            queryParams: {
              pubId: this.queja.id_publication
            }
          }
        )
      );
    }
  }

  /**
   * MÉTODO PARA ABRIR LA TRANSMISIÓN DE UNA PUBLICACIÓN:
   * @param event 
   */
  viewTransmission(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_transmission, contentData: this.queja.user.id });
  }

}
