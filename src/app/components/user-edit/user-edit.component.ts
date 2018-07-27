import { Component, OnInit, EventEmitter, Output, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { MediaFile } from '../../interfaces/media-file.interface';
import { DateManager } from '../../tools/date-manager';

declare var $: any;

@Component({
  selector: 'user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<boolean>();

  private SUBMIT = 0;
  private CLOSE = 1;
  private subscription: Subscription;

  public materialButtons: HorizonButton[];
  public userObj: User;
  public filesToUpload: any;

  constructor(
    private _userService: UserService,
    private _notifierService: NotifierService,
    private _cameraService: CameraService,

  ) {
    this.userObj = this._userService.getStoredUserData();

    this.materialButtons = [
      {
        action: this.SUBMIT,
        icon: "check"
      },
      {
        action: this.CLOSE,
        icon: "close"
      }
    ]

    /**
    * LISTEN TO NEW SNAPSHOT SENT BY NEW MEDIA CONTENT:
    */
    this.subscription = this._cameraService._snapShot.subscribe(
      (snapShot: MediaFile) => {
        this.addQuejaSnapShot(snapShot);
      });
  }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA EDITAR UN PERFIL DE USUARIO:
   */
  editProfile() {
    if (this.filesToUpload) {
      this.userObj.file = this.filesToUpload;
      this.userObj.fileName = DateManager.getFormattedDate() + ".png";
    }
    this._userService.saveUser(this.userObj);
  }

  /**
   * MÉTODO PARA MOSTRAR EL MODAL DE LA CAMARA
   * @param event = EVENTO DE LA CAMARA
   */
  newMedia(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.new_media, contentData: null });
  }

  /**
   * MÉTODO PARA EJECUTAR LA FUNCION SEGUN LA ACCION DEL BOTON
   * @param event = EVENTO DE LA CAMARA
   */
  actionBtn(event: number) {
    switch (event) {
      case this.SUBMIT:
        this.editProfile();
        break;
      case this.CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * MÉTODO PARA COLOCAR LA IMAGEN TOMADA EN EL MODAL Y ALMACENARLA EN UNA VARIABLE TIPO ARCHIVO
   * @param event = ARCHIVO FOTO
   */

  addQuejaSnapShot(media: MediaFile) {
    let cardImg = $("#frmU").find(".card-img-top");
    let defaultQuejaImg = $("#frmU").find(".card-img-top > #defaultQuejaImg");
    defaultQuejaImg.css("display", "none");
    cardImg.find("img").remove();
    cardImg.append('<img class="mb-1" src="' + media.mediaFileUrl + '" width="100%">');
    this.filesToUpload = media.mediaFile;
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
    this.subscription.unsubscribe();
  }
}
