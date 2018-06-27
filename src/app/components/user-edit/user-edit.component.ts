import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { UserService } from '../../services/user.service';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { MediaFile } from '../../interfaces/media-file.interface';

declare var $: any;

@Component({
  selector: 'user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit, OnDestroy {
  @Output() closeModal = new EventEmitter<boolean>();

  private SUBMIT = 0;
  private CLOSE = 1;
  private subscription: Subscription;
  private tempBirthdate;

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
        parentContentType: 1,
        action: this.SUBMIT,
        icon: "check"
      },
      {
        parentContentType: 1,
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
    this.userObj.person.birthdate = this.convertDateFormat(this.userObj.person.birthdate);
    this.tempBirthdate = this.userObj.person.birthdate;
  }


  /**
   * MÉTODO PARA EDITAR UN PERFIL DE USUARIO:
   */
  editProfile() {
    if (this.filesToUpload) {
      this.userObj.file = this.filesToUpload;
      this.userObj.fileName = this.getFormattedDate() + ".png";
    }
    this.formmatSendDate();
    this._userService.sendUser(this.userObj);
    this.restartDate();
    //this.closeModal.emit(true);
  }

  /**
   * MÉTODO PARA AGREGAR EL FORMATO MAS HORA EN LA FECHA DE NACIMIENTO:
  */
  formmatSendDate() {
    var date = new Date();
    this.userObj.person.birthdate = this.userObj.person.birthdate + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  }
  /**
   * MÉTODO QUE RETORNA A LA FECHA CON EL FORMATO SIN HORA
   */
  restartDate() {
    this.userObj.person.birthdate = this.tempBirthdate;
  }

  /**
   * MÉTODO QUE TRANSFORMA UN STRING EN FORMATO DE FECHA:
   */
  convertDateFormat(string) {
    var info = string.split('-');
    return info[0] + '-' + info[1] + '-' + info[2].substr(0, 2);
  }

  /**
  * MÉTODO QUE LLAMA A LA FUNCIÓN PARA CALCULAR LA EDAD DADA UNA FECHA DE NACIMIENTO
  */
  calculate() {
    this.age();
  }

  /**
   * MÉTODO QUE CALCULA LA EDAD
  */
  age() {
    var hoy = new Date();
    var cumpleanos = new Date(this.userObj.person.birthdate);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    this.userObj.person.age = edad;
    this.userObj.person.birthdate = this.convertDateFormat(this.userObj.person.birthdate);
    this.tempBirthdate = this.userObj.person.birthdate;
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
  * METODO PARA OBTENER LA FECHA
  */
  getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
