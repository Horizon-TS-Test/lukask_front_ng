import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONTENT_TYPES } from '../../config/content-type';
import { CameraService } from '../../services/camera.service';
import { MediaFile } from '../../interfaces/media-file.interface';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { ACTION_TYPES } from '../../config/action-types';
import { MEDIA_TYPES } from '../../config/media-types';
import { OnSubmit } from '../../interfaces/on-submit.interface';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { ASSETS } from 'src/app/config/assets-url';
import { CordovaCameraService } from 'src/app/services/cordova-camera.service';
import { EersaClient } from 'src/app/models/eersa-client';
import { EersaLocation } from 'src/app/models/eersa-location';
import * as Snackbar from 'node-snackbar';

@Component({
  selector: 'edit-queja',
  templateUrl: './edit-queja.component.html',
  styleUrls: ['./edit-queja.component.css'],
})

export class EditQuejaComponent implements OnDestroy, OnInit, OnChanges {
  @Input() isChildPub: boolean;
  @Input() submit: number;
  @Input() isStreamPub: number;
  @Input() eersaLocClient: { eersaClient: EersaClient, eersaLocation: EersaLocation };
  @Output() afterSubmit = new EventEmitter<OnSubmit>();
  @Output() validForm = new EventEmitter<boolean>();

  private subscription: Subscription;

  private SHOW_CLASS: string = 'slide-down';
  private ROTATE_CLASS: string = 'rotate-on';

  private _initSnapShotsNumber: number;
  private _maxSnapShots: number;
  private isEnabledCordovaCamera: boolean;
  private _hiddeShowAnimation: boolean;
  private _arrayVideo: any;

  public carouselOptions: any;
  public filesToUpload: MediaFile[];
  public showClass: string;
  public rotateClass: string;
  public media_type: any;

  constructor(
    private _dynaContentService: DynaContentService,
    private _cameraService: CameraService,
    private _cordovaCameraService: CordovaCameraService,
    private _domSanitizer: DomSanitizer
  ) {
    this.showClass = '';
    this.rotateClass = '';
    this._initSnapShotsNumber = 5;
    this._maxSnapShots = this._initSnapShotsNumber;
    this.media_type = MEDIA_TYPES;
    this._arrayVideo = [];
    this.initMediaFiles();

    //LISTEN TO NEW SNAPSHOT SENT BY NEW MEDIA CONTENT:
    this.subscription = this._cameraService.snapShot$.subscribe((snapShot: MediaFile) => {
      if (snapShot) {
        this.addQuejaSnapShot(snapShot);
      }
    });
  }

  ngOnInit() {
    this._hiddeShowAnimation = false;
    this.isEnabledCordovaCamera = this._cordovaCameraService.isCameraEnabled();
  }

  private initMediaFiles() {
    this.filesToUpload = [
      {
        mediaFileUrl: ASSETS.pubDefaultImg,
        type: MEDIA_TYPES.image,
        mediaFile: null,
        removeable: false,
        active: true,
        hidden: false
      }
    ];
  }

  /**
   * METODO PARA AÑADIR UNA IMAGEN EN LA SECCIÓN DE MEDIOS A PUBLICAR
   * @param media EL OBJETO DE TIPO MEDIA-FILE
   */
  public addQuejaSnapShot(media: MediaFile) {
    if (this.filesToUpload[0].removeable == false) {
      this.filesToUpload[0].hidden = true;
      this.filesToUpload[0].active = false;
    }
    else {
      for (let i = 0; i < this.filesToUpload.length; i++) {
        if (this.filesToUpload[i].active == true) {
          this.filesToUpload[i].active = false;
        }
      }
    }
    this.filesToUpload.splice(0, 0, media);
  }

  /**
   * METODO PARA ABRIR LA CÁMARA SEA DESDE CÓRDOVA SIENDO UN APP MOVIL O DESDE 
   * JAVASCRIPT COMO APP WEB / APP WEB PROGRESIVA PARA TOMAR UNA FOTOGRAFÍA
   * @param event 
   */
  public newMedia(event: any) {
    event.preventDefault();
    this.mutedVideos();

    if (this.filesToUpload.length < this._initSnapShotsNumber) {

      this._maxSnapShots = this._initSnapShotsNumber - this.filesToUpload.length;
      if (this.isEnabledCordovaCamera) {
        this._cordovaCameraService.openCamera((imgUri: any) => {
          
          if (imgUri) {
            
            this._cordovaCameraService.getFileBlob(imgUri, MEDIA_TYPES.image, (imgBlob) => {
              this.addQuejaSnapShot({ mediaFileUrl: imgUri, type: MEDIA_TYPES.image, mediaFile: imgBlob, removeable: true, active: true, hidden: false });
            });
          }
        });
      }
      else {
        this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.new_media, contentData: { maxSnapShots: this._maxSnapShots, backCamera: true, action: ACTION_TYPES.takeSnapshot } });
      }
    }
    else {
      Snackbar.show({ text: "Ha llegado al límite de imágenes permitidas", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
    }
  }

  /**
   * Proceso para realizar una grabacion de video desde la camara
   * @param event 
   */
  public newMediaVideo(event: any) {
    event.preventDefault();
    this.mutedVideos();
    if (this.filesToUpload.length < this._initSnapShotsNumber) {

      this._maxSnapShots = this._initSnapShotsNumber - this.filesToUpload.length;
      if (this.isEnabledCordovaCamera) {
        this._cordovaCameraService.openCameraVideo((videoUri: any) => {

          if (videoUri) {

            //Abre el progress bar.
            this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.progress_bar, contentData: 20 });

              this._cordovaCameraService.getFileBlob(videoUri.fullPath, MEDIA_TYPES.video, (videoBlob) => {
              this._dynaContentService.executeAccion({ contentType: CONTENT_TYPES.progress_bar, contentData: { method: 'close' } });
              this.addQuejaSnapShot({ mediaFileUrl: videoUri.localURL, type: MEDIA_TYPES.video, mediaFile: videoBlob, removeable: true, active: true, hidden: false });
              //this.addQuejaSnapShot({ mediaFileUrl: imgUri, mediaFile: imgBlob, removeable: true, active: true, hidden: false });
            });
          }
        });
      }
      else {
        this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.new_media, contentData: { maxSnapShots: this._maxSnapShots, backCamera: true, action: ACTION_TYPES.recordVideo } });
      }
    }
    else {
      Snackbar.show({ text: "Ha llegado al límite de medios permitidos", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
    }
  }
  
  /**
   * METODO PARA ELIMINAR UNA IMAGEN DEL GRUPO DE MEDIA
   * @param $event 
   * @param media MEDIO A SER ELIMINADO
   */
  public removeMedia(event: any, media: MediaFile) {
    event.preventDefault();

    let index = this.filesToUpload.findIndex(file => file.mediaFileUrl == media.mediaFileUrl && file.removeable == media.removeable);
    this.filesToUpload.splice(index, 1);
    this._maxSnapShots = this._initSnapShotsNumber - this.filesToUpload.length;

    if (this.filesToUpload.length == 1) {
      this.filesToUpload[0].hidden = false;
      this.filesToUpload[0].active = true;
    }
    else {
      if (index >= this.filesToUpload.length - 1) {
        this.filesToUpload[index - 1].active = true;
      }
      else {
        this.filesToUpload[index].active = true;
      }
    }

    Snackbar.show({ text: "El recurso se ha eliminado correctamente", pos: 'bottom-center', actionText: 'Listo', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
  }

  /**
   * METODO PARA ACTUALIZAR DE LA LISTA DE FOTOS, LA QUE DEBE SER ACTUAL AL MOMENTO DE DAR NEXT O PREV:
   * @param event 
   * @param next 
   */
  public setNewActive(event, next) {
    event.preventDefault();
    let nextPrevTimeout;
    clearTimeout(nextPrevTimeout);

    nextPrevTimeout = setTimeout(() => {
      let size = this.filesToUpload.length - 1;
      for (let i = 0; i < size; i++) {
        if (this.filesToUpload[i].active == true) {
          this.filesToUpload[i].active = false;
          if (next) {
            if (i + 1 == size) {
              this.filesToUpload[0].active = true;
            }
            else {
              this.filesToUpload[i + 1].active = true;
            }
          }
          else {
            if (i - 1 == -1) {
              this.filesToUpload[size - 1].active = true;
            }
            else {
              this.filesToUpload[i - 1].active = true;
            }
          }
          i = size;
        }
      }
    }, 1100);
  }

  /**
   * METODO PARA REALIZAR UN PROCESO EN LA INTERFAZ DESPUÉS DE RECIBIR LA RESPUESTA DEL POST DE UNA PUBLICACIÓN:
   * @param event VALOR INDICATIVO DE QUE EL SUBMIT HA SIDO PROCESADO. OBJETO EVENT EMITTER
   */
  public processAfterSubmit(event: OnSubmit) {
    this.afterSubmit.emit(event);
  }

  /**
   * METODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
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
        case 'eersaLocClient':
          if (changes[property].currentValue) {
            this.eersaLocClient = changes[property].currentValue;
          }
          break;
      }
    }
  }

  /**
   * Silecia los video.
   */
  private mutedVideos(){
    this._arrayVideo = document.querySelectorAll(".mediaVideo");
    for (let video of this._arrayVideo){
      video.muted = true;
    }
  }

  /**
   * Silecia los video.
   */
  private unMutedVideos(){
    this._arrayVideo = document.querySelectorAll(".mediaVideo");
    for (let video of this._arrayVideo){
      if(video.muted){
        video.muted = false;
      }
    }
  }

  public animation(event: any) {
    event.preventDefault();
    if (!this._hiddeShowAnimation) {
      this._hiddeShowAnimation = true;
      this.showClass = this.SHOW_CLASS;
      this.rotateClass = this.ROTATE_CLASS;

    } else {
      this._hiddeShowAnimation = false;
      this.showClass = '';
      this.rotateClass = '';
    }
  }

  /**
   * METODO PARA DETECTAR QUE EL FORMULARIO DE QUEJA/RECLAMO ES VÁLIDO
   * @param event VALOR QUE VIENE DEL OBJETO EVENT EMITTER:
   */
  public onValidForm(event: boolean) {
    this.validForm.emit(event);
  }
  
  ngOnDestroy() {
    this._dynaContentService.loadDynaContent(null);
    this.subscription.unsubscribe();
  }
}
