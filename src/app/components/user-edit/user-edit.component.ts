import { Component, OnInit, EventEmitter, Output, OnDestroy, SimpleChanges, Input, OnChanges, AfterViewChecked, AfterViewInit } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { User } from '../../models/user';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { MediaFile } from '../../interfaces/media-file.interface';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { ACTION_TYPES } from '../../config/action-types';
import { UserService } from '../../services/user.service';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { ASSETS } from 'src/app/config/assets-url';

@Component({
  selector: 'user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<boolean>();

  private subscription: Subscription;

  public materialButtons: HorizonButton[];
  public userProfile: User;
  public fileToUpload: MediaFile;
  public carouselOptions: any;
  public actionType: number;
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private _dynaContentService: DynaContentService,
    private _cameraService: CameraService,
    private _userService: UserService,
    public _domSanitizer: DomSanitizer
  ) {
    this.fileToUpload = {
      mediaFileUrl: ASSETS.pubDefaultImg,
      mediaFile: null,
      removeable: false
    };

    this.materialButtons = [
      {
        action: ACTION_TYPES.userEdition,
        icon: 'check',
        class: 'custom-btn-normal'
      },
      {
        action: ACTION_TYPES.close,
        icon: 'close'
      }
    ]

    /**
    * LISTEN TO NEW SNAPSHOT SENT BY NEW MEDIA CONTENT:
    */
    this.subscription = this._cameraService.snapShot$.subscribe(
      (snapShot: MediaFile) => {
        if (snapShot) {
          this.addUserSnapShot(snapShot);
        }
      });

  }

  ngOnInit() {
    this.initCarousel();
  }

  ngAfterViewInit() {
    this.setUserProfile();
  }

  /**
   * MÉTODO PARA CARGAR LOS DATOS DEL PERFIL DE USUARIO A MODIFICAR
   */
  private setUserProfile() {
    this._userService.getRevalidatedUser().then((userData: User) => {
      this.userProfile = userData;
      this.fileToUpload.mediaFileUrl = this._userService.getUserProfile().profileImg;
    });
  }

  /**
   * MÉTODO PARA ACTIVAR EL EECTO DE CARGANDO:
   */
  private loadingAnimation() {
    this.loadingClass = 'on';
    this.activeClass = 'active';
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  private initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false
    };
  }

  /**
   * MÉTODO PARA MOSTRAR EL MODAL DE LA CAMARA
   * @param event = EVENTO DE LA CAMARA
   */
  public newMedia(event: any) {
    event.preventDefault();
    this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.new_media, contentData: { maxSnapShots: 1 } });
  }

  /**
   * MÉTODO PARA COLOCAR LA IMAGEN TOMADA EN EL MODAL Y ALMACENARLA EN UNA VARIABLE TIPO ARCHIVO
   * @param event = ARCHIVO FOTO
  */
  public addUserSnapShot(media: MediaFile) {
    this.fileToUpload = media;
  }

  public childAfterSubmit(event: any) {
    if (event) {
      this.closeModal.emit(true);
    }
  }

  /**
  * MÉTODO PARA EJECUTAR LA FUNCION SEGUN LA ACCION DEL BOTON
  * @param event = EVENTO DE LA CAMARA
  */
  public actionBtn(event: number) {
    switch (event) {
      case ACTION_TYPES.userEdition:
        this.actionType = null;
        setTimeout(() => {
          this.actionType = ACTION_TYPES.userEdition;
          this.showClass = '';
        });
        this.loadingAnimation();
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      switch (property) {
        case 'showClass':
          if (changes[property].currentValue !== undefined) {
            this.showClass = changes[property].currentValue;
          }
          break;
      }
    }
  }

  ngOnDestroy() {
    this._dynaContentService.loadDynaContent(null);
    this.subscription.unsubscribe();
  }
}
