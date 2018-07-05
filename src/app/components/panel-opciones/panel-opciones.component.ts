import { Component, OnInit, Input, Output, SimpleChanges, OnChanges, EventEmitter } from '@angular/core';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { SubscribeService } from '../../services/subscribe.service';
import { ContentService } from '../../services/content.service';

declare var $: any;

@Component({
  selector: 'app-panel-opciones',
  templateUrl: './panel-opciones.component.html',
  styleUrls: ['./panel-opciones.component.css']
})
export class PanelOpcionesComponent implements OnInit, OnChanges {
  @Input() entriesNumber: number;
  @Output() seenEntries = new EventEmitter<boolean>();

  public contentTypes: any;
  public isAble: boolean;

  constructor(
    private _notifierService: NotifierService,
    private _subscribeService: SubscribeService,
    private _contentService: ContentService,
  ) {
    this.contentTypes = CONTENT_TYPES;
  }

  ngOnInit() {
    this.isAbleToSubscribe();
  }

  /**
   * MÉTODO PARA HABILITAR O DESHABILITAR EL BOTÓN DE ACTIVAR NOTIFICACIONES 
   * PUSH DEPENDIENDO DE SI EL NAVEGADOR SOPORTA O NO ESTA FUNCIONALIDAD:
   */
  isAbleToSubscribe() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      this.isAble = true;
    }
    else {
      this.isAble = false;
    }
  }

  /**
   * MÉTODO PARA SOLICITAR QUE SE INCRUSTE DINÁMICAMENTE UN HORIZON MODAL CON CIERTO CONTENIDO EN SU INTERIOR
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
   */
  openLayer(event: any, contType: number) {
    event.preventDefault();
    if (contType == this.contentTypes.view_notifs) {
      this.seenEntries.emit(true);
    }
    this._notifierService.notifyNewContent({ contentType: contType, contentData: null });
  }

  /**
   * MÉTODO PARA PROCESAR LA SUBSCRIPCIÓN AL SERVIDOR DE NOTIFICACIONES PUSH PARA 
   * PODER RECIBIR NOTIFICACIONES ACERCA DE NUEVAS ACTUALIZACIONES EN LA APP:
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   */
  subscribe(event: any) {
    event.preventDefault();
    this._subscribeService.askForSubscription();
  }

  /**
   * MÉTODO PARA SOLICITAR QUE SE DE FOCUS A UNA OPCIÓN SELECCIONADA DEL MENÚ DE NAVEGACIÓN:
   * @param idContent ID HTML DE LA OPCIÓN SELECCIONADA
   */
  focusOption(idContent: string) {
    this._contentService.focusMenuOption($("#id-top-panel"), idContent);
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {

    for (let property in changes) {
      if (property === 'entriesNumber') {
        /*console.log('Previous:', changes[property].previousValue);
        console.log('Current:', changes[property].currentValue);
        console.log('firstChange:', changes[property].firstChange);*/

        if (changes[property].currentValue) {
          this.entriesNumber = changes[property].currentValue;
        }
      }
    }
  }
}
