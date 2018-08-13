import { Component, OnInit, Input, SimpleChanges, OnChanges, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Province } from '../../models/province';
import { Select2 } from '../../interfaces/select2.interface';
import { Canton } from '../../models/canton';
import { Parroquia } from '../../models/parroquia';
import { ACTION_TYPES } from '../../config/action-types';
import { MediaFile } from '../../interfaces/media-file.interface';
import { DateManager } from '../../tools/date-manager';
import { NotifierService } from '../../services/notifier.service';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';

@Component({
  selector: 'user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() actionType: number;
  @Input() mediaFile: MediaFile;
  @Output() closeModal: EventEmitter<boolean>;

  private province: string;
  private canton: string;
  private parroquia: string;
  private alertData: Alert;

  public userObj: User;
  public provinceList: Province[];
  public provinceSelect: Select2[];
  public cantonList: Canton[];
  public cantonSelect: Select2[];
  public parroquiaList: Parroquia[];
  public parroquiaSelect: Select2[];

  constructor(
    private _userService: UserService,
    private _notifierService: NotifierService
  ) {
    this.userObj = this._userService.getUserProfile();
    this.province = (this.userObj) ? this.userObj.person.location[0].province.id : null;
    this.canton = (this.userObj) ? this.userObj.person.location[1].canton.id : null;
    this.parroquia = (this.userObj) ? this.userObj.person.location[2].parish.id : null;
    this.userObj = (!this.userObj) ? new User("", "", "", true, "", "", "") : this.userObj;

    this.closeModal = new EventEmitter<boolean>();
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.getProvince();
  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getProvince() {
    this.provinceSelect = [];

    this._userService.getProvinceList().then((qProvinces) => {
      this.provinceList = qProvinces;
      for (let type of this.provinceList) {
        if (!this.province) {
          this.province = type.id_province;
        }

        this.provinceSelect.push({ value: type.id_province, data: type.name, selectedItem: (this.province == type.id_province) ? this.province : "" });
        this.userObj.person.parroquia.canton.province.id_province = this.province;
      }

      if (this.province) {
        this.getCanton(this.province);
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
    this.cantonSelect = [];
    this.parroquiaSelect = [];
    this.canton = "";
    this.parroquia = "";

    this.getCanton(this.province);
  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getCanton(id_provincia: any) {
    this.cantonSelect = [];

    this._userService.getCantonList(id_provincia).then((qCantones) => {
      this.cantonList = qCantones;

      for (let type of this.cantonList) {
        if (!this.canton) {
          this.canton = type.id_canton;
        }

        this.cantonSelect.push({ value: type.id_canton, data: type.name, selectedItem: (this.canton == type.id_canton) ? this.canton : "" });
        this.userObj.person.parroquia.canton.id_canton = this.canton;
      }

      if (this.canton) {
        this.getParroquia(this.canton);
      }
    });
  }

  /**
 * METODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
 * @param event 
 */
  getCantonSelect(event: string) {
    this.canton = event;
    this.parroquiaSelect = [];
    this.parroquia = "";
    this.userObj.person.parroquia.canton.id_canton = this.canton;
    this.getParroquia(this.canton);
  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getParroquia(id_canton: any) {
    this.parroquiaSelect = [];
    this._userService.getParroquiaList(id_canton).then((qParroquia: Parroquia[]) => {
      this.parroquiaList = qParroquia;

      for (let parroq of this.parroquiaList) {
        if (!this.parroquia) {
          this.parroquia = parroq.id_parroquia;
        }

        this.parroquiaSelect.push({ value: parroq.id_parroquia, data: parroq.name, selectedItem: (this.parroquia === parroq.id_parroquia) ? this.parroquia : "" });
        this.userObj.person.parroquia.id_parroquia = this.parroquia;
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

  /**
   * MÉTODO PARA AGREGAR EL FORMATO MAS HORA EN LA FECHA DE NACIMIENTO:
  */
  formmatSendDate() {
    var date = new Date();
    this.userObj.person.transBirthDate = this.userObj.person.transBirthDate + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }

  /**
   * MÉTODO PARA CALCULAR LA EDAD DE UN USUARIO
   */
  calculateAge() {
    let age = DateManager.calcAge(this.userObj.person.transBirthDate);

    this.userObj.person.age = age;
    this.userObj.person.transBirthDate = DateManager.convertStringToDate(this.userObj.person.transBirthDate);
  }

  /**
   * MÉTODO PARA MOSTRAR UN ALERTA EN EL DOM:
   */
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  /**
  * MÉTODO PARA REGISTRAR O EDITAR UN PERFIL DE USUARIO:
  */
  createUpdateProfile(update: boolean = false) {
    if (this.mediaFile) {
      this.userObj.file = this.mediaFile.mediaFile;
      this.userObj.fileName = DateManager.getFormattedDate() + ".png";
    }

    this.formmatSendDate();
    if (update) {
      this._userService.sendUser(this.userObj).then((resp: boolean) => {
        this.closeModal.emit(true);
        setTimeout(() => {
          this.alertData = new Alert({ title: 'Proceso Correcto', message: "Su perfil se ha actualizado correctamente", type: ALERT_TYPES.success });
          this.setAlert();
        }, 200);
      }).catch((err) => {
        if (err.code == 400) {
          this.alertData = new Alert({ title: 'Proceso Fallido', message: "Verifique que los datos ingresados sean correctos", type: ALERT_TYPES.danger });
        }
        else {
          this.alertData = new Alert({ title: 'Error Inesperado', message: "Lamentamos los inconvenientes, por favor intente más tarde", type: ALERT_TYPES.danger });
        }
        this.closeModal.emit(true);
        setTimeout(() => {
          this.setAlert();
        }, 200);
      });
    }
    else {
      this._userService.registerUser(this.userObj).then((resp: boolean) => {
        this.closeModal.emit(true);
        setTimeout(() => {
          this.alertData = new Alert({ title: 'Proceso Correcto', message: "Usted se ha registrado correctamente a LUKASK", type: ALERT_TYPES.success });
          this.setAlert();
        }, 200);
      }).catch((err) => {
        console.log(err);
        if (err.code == 400) {
          this.alertData = new Alert({ title: 'Proceso Fallido', message: "Verifique que los datos ingresados sean correctos", type: ALERT_TYPES.danger });
        }
        else {
          this.alertData = new Alert({ title: 'Error Inesperado', message: "Lamentamos los inconvenientes, por favor intente más tarde", type: ALERT_TYPES.danger });
        }
        this.closeModal.emit(true);
        setTimeout(() => {
          this.setAlert();
        }, 200);
      });
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LOS CAMBIOS QUE SE DEN EN EL ATRIBUTO QUE VIENE DESDE EL COMPONENTE PADRE:
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      switch (property) {
        case 'actionType':
          if (changes[property].currentValue) {
            this.actionType = changes[property].currentValue;
            if (this.actionType == ACTION_TYPES.userRegister) {
              this.createUpdateProfile();
            }
            else if (this.actionType == ACTION_TYPES.userEdition) {
              this.createUpdateProfile(true);
            }
          }
          break;
        case 'mediaFile':
          this.mediaFile = changes[property].currentValue;
          break;
      }
    }
  }

}
