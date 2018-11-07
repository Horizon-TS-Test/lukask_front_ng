import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONTENT_TYPES } from '../../config/content-type';
import { CameraService } from '../../services/camera.service';
import { MediaFile } from '../../interfaces/media-file.interface';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { ACTION_TYPES } from '../../config/action-types';
import { OnSubmit } from '../../interfaces/on-submit.interface';
import * as Snackbar from 'node-snackbar';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { ASSETS } from 'src/app/config/assets-url';

@Component({
  selector: 'edit-queja',
  templateUrl: './edit-queja.component.html',
  styleUrls: ['./edit-queja.component.css'],
})
export class EditQuejaComponent implements OnDestroy, OnChanges {
  @Input() submit: number;
  @Input() isStreamPub: number;
  @Output() afterSubmit = new EventEmitter<OnSubmit>();

  private subscription: Subscription;

  private _initSnapShotsNumber: number;
  private _maxSnapShots: number;

  public carouselOptions: any;
  public filesToUpload: MediaFile[];

  constructor(
    private _dynaContentService: DynaContentService,
    private _cameraService: CameraService,
    private _domSanitizer: DomSanitizer
  ) {
    this._initSnapShotsNumber = 5;
    this._maxSnapShots = this._initSnapShotsNumber;

    this.initMediaFiles();

    //LISTEN TO NEW SNAPSHOT SENT BY NEW MEDIA CONTENT:
    this.subscription = this._cameraService.snapShot$.subscribe((snapShot: MediaFile) => {
      if (snapShot) {
        this.addQuejaSnapShot(snapShot);
      }
    });
  }

  private initMediaFiles() {
    this.filesToUpload = [
      {
        mediaFileUrl: ASSETS.pubDefaultImg,
        mediaFile: null,
        removeable: false
      }
    ];
  }

  /**
   * MÉTODO PARA AÑADIR UNA IMAGEN EN LA SECCIÓN DE MEDIOS A PUBLICAR
   * @param media EL OBJETO DE TIPO MEDIA-FILE
   */
  public addQuejaSnapShot(media: MediaFile) {
    if (!this.filesToUpload[0].mediaFile) {
      this.filesToUpload.splice(0, 1);
    }
    this.filesToUpload.push(media);
  }

  /**
   * MÉTODO PARA ABRIR LA CÁMARA PARA TOMAR UNA FOTOGRAFÍA:
   * @param event 
   */
  public newMedia(event: any) {
    event.preventDefault();
    if (this.filesToUpload.length < this._initSnapShotsNumber) {
      this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.new_media, contentData: { maxSnapShots: this._maxSnapShots, backCamera: true } });
    }
    else {
      Snackbar.show({ text: "Ha llegado al límite de imágenes permitidas", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
    }
  }

  /**
   * MÉTODO PARA ELIMINAR UNA IMAGEN DEL GRUPO DE MEDIA
   * @param $event 
   * @param i POSICIÓN DEL ARRAY DE MEDIA A ELIMINAR
   */
  public removeMedia(event: any, media: MediaFile) {
    event.preventDefault();
    this.filesToUpload.splice(this.filesToUpload.indexOf(media), 1);
    this._maxSnapShots = this._initSnapShotsNumber - this.filesToUpload.length;
    if (this.filesToUpload.length == 0) {
      this.initMediaFiles();
    }

    Snackbar.show({ text: "El recurso se ha eliminado correctamente", pos: 'bottom-center', actionText: 'Listo', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {

    for (const property in changes) {
      /*console.log('Previous:', changes[property].previousValue);
      console.log('Current:', changes[property].currentValue);
      console.log('firstChange:', changes[property].firstChange);*/
      switch (property) {
        case 'submit':
          if (changes[property].currentValue && changes[property].currentValue == ACTION_TYPES.submitPub) {
            this.submit = changes[property].currentValue;
          }
          break;
        case 'isStreamPub':
          if (changes[property].currentValue) {
            this.isStreamPub = changes[property].currentValue;
          }
          break;
      }
    }
  }

  /**
   * MÉTODO PARA REALIZAR UN PROCESO EN LA INTERFAZ DESPUÉS DE RECIBIR LA RESPUESTA DEL POST DE UNA PUBLICACIÓN:
   * @param event VALOR INDICATIVO DE QUE EL SUBMIT HA SIDO PROCESADO. OBJETO EVENT EMITTER
   */
  public processAfterSubmit(event: OnSubmit) {
    this.afterSubmit.emit(event);
  }

  ngOnDestroy() {
    this._dynaContentService.loadDynaContent(null);
    this.subscription.unsubscribe();
  }

}
