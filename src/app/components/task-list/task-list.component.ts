import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges } from '@angular/core';
import { ActionService } from '../../services/action.service';
import { Publication } from '../../models/publications';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { ACTION_TYPES } from '../../config/action-types';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import * as Snackbar from 'node-snackbar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

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

  private alertData: Alert;
  private relevanceProc: boolean;

  constructor(
    private _actionService: ActionService,
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _userService: UserService,
    private _router: Router
  ) {
    this.relevanceProc = true;
  }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA MOSTRAR UN ALERTA EN EL DOM:
   */
  private setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  /**
   * MÉTODO PARA DAR RELEVANCIA A UNA PUBLICACIÓN Y ENVIARLA AL BACKEND:
   * @param event 
   */
  public onRelevance(event: any) {
    event.preventDefault();
    if (!this.queja.isOffline && this.relevanceProc == true && !this.queja.offRelevance) {
      this.relevanceProc = false;
      this._actionService.saveRelevance(this.queja.id_publication, null, !this.queja.user_relevance)
        .then((response: any) => {
          if (response == 'backSyncOk') {
            Snackbar.show({ text: 'Tu apoyo se enviará en la próxima conexión', pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
            this.queja.offRelevance = true;
          }
          else {
            this.queja.user_relevance = response;
          }
          this.relevanceProc = true;
        })
        .catch((error) => {
          this.alertData = new Alert({ title: 'Proceso Fallido', message: 'No se ha podido procesar la petición', type: ALERT_TYPES.danger });
          this.setAlert();
          this.relevanceProc = true;
        });
    }
  }

  /**
   * MÉTODO PARA GEOLOCALIZAR LA QUEJA SELECCIONADA
   */
  public geolocatePub(event: any) {
    event.preventDefault();
    if (this.isModal == true) {
      this._contentService.elementScrollInside($(".horizon-modal"), $("#sigle-map").offset().top);
    }
    else {
      if (!this.queja.isOffline) {
        this.actionType.emit(ACTION_TYPES.mapFocus);
      }
    }
  }

  /**
   * MÉTODO PARA ABRIR LA TRANSMISIÓN DE UNA PUBLICACIÓN:
   * @param event 
   */
  public viewTransmission(event: any) {
    event.preventDefault();
    if (!this.queja.isOffline && !this.queja.transDone) {
      this._userService.onStreaming = true;
      this._router.navigateByUrl('/streaming?pub=' + this.queja.id_publication + '&owner=' + this.queja.user.id);
    }
  }

  /**
   * MÉTODO PARA ABRIR UN MODAL CON LA LISTA DE PERSONAS QUE APOYAN LA PUBLICACIÓN:
   * @param event 
   */
  public viewSupport(event: any) {
    event.preventDefault();
    if (!this.queja.isOffline) {
      this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.support_list, contentData: { pubId: this.queja.id_publication, pubOwner: this.queja.user.person.name } });
    }
  }

  /**
   * MÉTODO PARA CANCELAR EL ENVÍO DE UNA RELEVANCIA OFFLINE AL SERVIDOR:
   */
  public cancelPubRelevance(event: any) {
    event.preventDefault();
    this.queja.offRelevance = false;
    this._actionService.deleteOffRel(this.queja.id_publication, false);
  }
}
