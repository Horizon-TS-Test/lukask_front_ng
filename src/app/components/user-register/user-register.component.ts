import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { User } from '../../models/user';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { MediaFile } from '../../interfaces/media-file.interface';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { UserService } from '../../services/user.service';
import { Province } from '../../models/province';
import { Canton } from '../../models/canton';
import { Parroquia } from '../../models/parroquia';
import { Select2 } from '../../interfaces/select2.interface';

declare var $: any;
@Component({
  selector: 'user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {
  @Output() closeModal = new EventEmitter<boolean>();

  private SUBMIT = 0;
  private CLOSE = 1;
  private subscription: Subscription;
  private tempBirthdate;
  private province: string;
  private canton: string;
  private parroquia: string;

  public materialButtons: HorizonButton[];
  public userObj: User;
  public filesToUpload: any;

  public provinceList: Province[];
  public provinceSelect: Select2[];
  public cantonList: Canton[];
  public cantonSelect: Select2[];
  public parroquiaList: Parroquia[];
  public parroquiaSelect: Select2[];

  constructor(
    private _userService: UserService,
    private _cameraService: CameraService,
    private _notifierService: NotifierService

  ) {
    this.userObj = new User("", "", "", true, "", "");

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

  ngOnInit() {
    this.getProvince();
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
  * METODO PARA OBTENER LA FECHA
  */
  getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
  }

  /**
  * MÉTODO PARA EJECUTAR LA FUNCION SEGUN LA ACCION DEL BOTON
  * @param event = EVENTO DE LA CAMARA
  */
  actionBtn(event: number) {
    switch (event) {
      case this.SUBMIT:
        this.registerProfile();
        break;
      case this.CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

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
   * MÉTODO QUE TRANSFORMA UN STRING EN FORMATO DE FECHA:
   */
  convertDateFormat(string) {
    var info = string.split('-');
    return info[0] + '-' + info[1] + '-' + info[2].substr(0, 2);
  }

  /**
  * METODO PARA OBTENER LA FECHA
  */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
  * MÉTODO PARA EDITAR UN PERFIL DE USUARIO:
  */
  registerProfile() {
    if (this.filesToUpload) {
      this.userObj.file = this.filesToUpload;
      this.userObj.fileName = this.getFormattedDate() + ".png";
    }

    /*this.userObj.objParroquia.id_parroquia = this.parroquia;
    this.userObj.objParroquia.canton.id_canton = this.canton;
    this.userObj.objParroquia.canton.province.id_province = this.province;*/
    console.log("Objetooooooosssssss.........");
    console.log(this.userObj);
    this.formmatSendDate();
    this._userService.registerUser(this.userObj);
    this.restartDate();
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
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getProvince() {
    this._userService.getProvinceList().then((qProvinces) => {
      this.provinceList = qProvinces;
      this.provinceSelect = [];
      this.provinceSelect.push({ value: "", data: "" });
      for (let type of this.provinceList) {
        if (!this.province) {
          this.province = type.id_province;
        }
        this.provinceSelect.push({ value: type.id_province, data: type.name });
      }
    });
  }

  /**
   * METODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
   * @param event 
   */
  getProvinciaSelect(event: string) {
    this.province = event;
    this.userObj.person.parroquia.canton.province.id_province = this.province;
    this.getCanton(this.province);
  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getCanton(id_provincia: any) {
    this._userService.getCantonList(id_provincia).then((qCantones) => {
      this.cantonList = qCantones;
      this.cantonSelect = [];
      for (let type of this.cantonList) {
        if (!this.canton) {
          this.canton = type.id_canton;
        }
        this.cantonSelect.push({ value: type.id_canton, data: type.name });
      }
    });
  }

  /**
 * METODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
 * @param event 
 */
  getCantonSelect(event: string) {
    this.canton = event;
    this.userObj.person.parroquia.canton.id_canton = this.canton;
    this.getParroquia(this.canton);
  }


  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getParroquia(id_canton: any) {
    this._userService.getParroquiaList(id_canton).then((qParroquia) => {

      this.parroquiaSelect = [];
      var parroquiaList = qParroquia;

      for (let id in parroquiaList) {
        if (!this.parroquia) {
          this.parroquia = parroquiaList[id].id_parroquia;
        }
        this.parroquiaSelect.push({ value: parroquiaList[id].id_parroquia, data: parroquiaList[id].name });
      }
    });
  }

  /**
   * METODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
   * @param event 
   */
  getParroquiaSelect(event: string) {
    this.parroquia = event;
    this.userObj.person.parroquia.id_parroquia = this.parroquia;
  }
}
