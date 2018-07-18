import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { CameraService } from '../../services/camera.service';
import { MediaFile } from '../../interfaces/media-file.interface';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { ACTION_TYPES } from '../../config/action-types';

declare var $: any;

@Component({
  selector: 'edit-queja',
  templateUrl: './edit-queja.component.html',
  styleUrls: ['./edit-queja.component.css'],
})
export class EditQuejaComponent implements OnInit, OnDestroy, OnChanges {
  @Input() submit: number;

  private subscription: Subscription;
  public carouselOptions: any;
  public filesToUpload: MediaFile[];

  constructor(
    private _notifierService: NotifierService,
    private _cameraService: CameraService,
    private _domSanitizer: DomSanitizer,
  ) {

    this.filesToUpload = [
      {
        mediaFileUrl: "/assets/images/edit-queja/window.jpg",
        mediaFile: null
      }
    ];

    //LISTEN TO NEW SNAPSHOT SENT BY NEW MEDIA CONTENT:
    this.subscription = this._cameraService._snapShot.subscribe(
      (snapShot: MediaFile) => {
        console.log("new snapshot received!!");
        this.addQuejaSnapShot(snapShot);
      }
    );
  }

  ngOnInit() {
    this.initCarousel();
  }

  ngAfterViewInit() { }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE FOTOS:
   */
  initCarousel() {
    $('.carousel').carousel()
  }

  /**
   * MÉTODO PARA AÑADIR UNA IMAGEN EN LA SECCIÓN DE MEDIOS A PUBLICAR
   * @param media EL OBJETO DE TIPO MEDIA-FILE
   */
  addQuejaSnapShot(media: MediaFile) {
    if (!this.filesToUpload[0].mediaFile) {
      this.filesToUpload.splice(0, 1);
    }
    this.filesToUpload.push(media);
  }

  /**
   * MÉTODO PARA ABRIR LA CÁMARA PARA TOMAR UNA FOTOGRAFÍA:
   * @param event 
   */
  newMedia(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.new_media, contentData: null });
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
      if (changes[property].currentValue && changes[property].currentValue == ACTION_TYPES.submitPub) {
        this.submit = changes[property].currentValue
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
