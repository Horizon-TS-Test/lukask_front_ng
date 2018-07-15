import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { CameraService } from '../../services/camera.service';
import { MediaFile } from '../../interfaces/media-file.interface';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'edit-queja',
  templateUrl: './edit-queja.component.html',
  styleUrls: ['./edit-queja.component.css'],
})
export class EditQuejaComponent implements OnInit, OnDestroy {
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
