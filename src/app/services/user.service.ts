import { Injectable, EventEmitter } from '@angular/core';
import { User } from '../models/user';
import { Person } from '../models/person';
import { REST_SERV } from '../rest-url/rest-servers';
import { CrytoGen } from '../tools/crypto-gen';
import { Http, Headers, Response } from '@angular/http';

declare var writeData: any;
declare var readAllData: any;
declare var deleteItemData: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userProfile: User;
  public _userUpdate = new EventEmitter<boolean>();

  constructor(
    private _http: Http
  ) { }

  /**
   * MÉTODO PARA ALMACENAR EN EL LOCAL STORAGE DEL NAVEGADOR LAS CREDENCIALES PUBLICAS DEL USUARIO:
   */
  public storeUserCredentials(jsonUser: any) {
    localStorage.setItem('user_key', jsonUser.user_key);
    localStorage.setItem('user_id', jsonUser.user_id);
    this.getRestUserProfile();
  }

  /**
   * MÉTODO PARA OBTENER LOS DATOS DEL USUARIO DESDE LA WEB:
   * @param id ID DEL USUARIO
   */
  public getRestUserProfile() {
    const reqHeaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this.getUserKey() });
    let userId = CrytoGen.decrypt(localStorage.getItem("user_id"));

    this._http.get(REST_SERV.userUrl + userId + "/", { headers: reqHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const userJson = response.json().data;
        this.updateUserData(userJson);

        console.log("[LUKASK USER SERVICE] - USER PROFILE FROM WEB", this.getUserProfile());
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error);
      });
  }

  /**
   * MÉTODO PARA ALMACENAR EN INDEXED DB EL ID DE USUARIO LOGEADO:
   * @param userId 
   */
  private storeUserIndexedTable(userKey: any, userData: any) {
    if ('serviceWorker' in navigator && 'SyncManager' in window && 'indexedDB' in window) {
      readAllData('ownuser')
        .then((tableData) => {
          if (tableData.length == 0) {
            writeData('ownuser', JSON.parse(JSON.stringify({ id: new Date().toISOString(), user_key: userKey, user_data: userData })));
          }
          else {
            for (let user of tableData) {
              deleteItemData('ownuser', user.id)
                .then(() => {
                  writeData('ownuser', JSON.parse(JSON.stringify({ id: new Date().toISOString(), user_key: userKey, user_data: userData })));
                });
            }
          }
        });
    }
  }

  /**
   * MÉTODO PARA ACTUALIZAR EN EL NAVEGADOR LA INFORMACIÓN DEL PERFIL DE USUARIO:
   */
  public updateUserData(jsonUser: any) {
    let cryptoData = CrytoGen.encrypt(JSON.stringify(jsonUser));
    localStorage.setItem('user_data', cryptoData);

    this.storeUserIndexedTable(localStorage.getItem('user_key'), cryptoData);
    this.setUserProfile();
    this._userUpdate.emit(true);
  }

  /**
   * MÉTODO PARA EDITAR LOS DATOS DEL PERFIL
   */
  public sendUser(user: User) {
    let userFormData: FormData = this.mergeFormData(user);
    this.postUserClient(userFormData)
      .then(
        (response: any) => {
          this.updateUserData(response);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  /**
   * MÉTODO PARA TOMAR LOS DATOS QUE BIENEN POR POST 
   */
  mergeFormData(user: User) {
    let formData = new FormData();

    formData.append('id', user.id);
    formData.append('email', user.username);
    formData.append('person_id', user.person.id_person);
    formData.append('age', user.person.age + "");
    formData.append('identification_card', user.person.identification_card);
    formData.append('name', user.person.name);
    formData.append('last_name', user.person.last_name);
    formData.append('telephone', user.person.telephone);
    formData.append('address', user.person.address);
    formData.append('cell_phone', user.person.cell_phone);
    formData.append('birthdate', user.person.birthdate);
    formData.append('user_file', user.file, user.fileName);
    formData.append('is_active', "true");

    return formData;
  }

  /**
   * MÉTODO PARA ENVIAR MEDIANTE POST LOS DATOS DEL PERFIL
   * @param userFormData 
   */
  postUserClient(userFormData: FormData) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let resp = JSON.parse(xhr.response).data;
            console.log(JSON.parse(xhr.response));
            resolve(resp);
          }
          else {
            if (xhr.status == 401) {
              localStorage.clear();
            }
            reject(xhr.response);
          }
        }
      };
      xhr.open("post", REST_SERV.userUrl + userFormData.get("id"), true);
      xhr.setRequestHeader('X-Access-Token', this.getUserKey());
      xhr.withCredentials = true;
      xhr.send(userFormData);
    });
  }

  /**
   * MÉTODO PARA EXTRAER LOS DATOS DE USUARIO DE UN JSON STRING Y GUARDARLO EN UN OBJETO DE TIPO MODELO USER
   * @param jsonUser ES EL JSON STRING QUE CONTIENE LOS DATOS DEL USUARIO
   */
  extractUserJson(jsonUser: any) {
    let user: User;

    jsonUser.media_profile = (jsonUser.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack + jsonUser.media_profile : jsonUser.media_profile;
    user = new User(jsonUser.email, '', jsonUser.media_profile, true, null, null, jsonUser.id);
    user.person = new Person(jsonUser.person.id_person, jsonUser.person.age, jsonUser.person.identification_card, jsonUser.person.name, jsonUser.person.last_name, jsonUser.person.telephone, jsonUser.person.address);

    return user;
  }

  /**
   * MÉTODO PARA OBTENER LA INFORMACIÓN DEL PERFIL DE USUARIO Y DESENCRIPTARLO
   */
  getStoredUserData() {
    let storedData = localStorage.getItem('user_data');
    let userData = CrytoGen.decrypt(storedData);

    return this.extractUserJson(JSON.parse(userData));
  }

  /**
   * MÉTODO PARA DETERMINAR SI UN USUARIO ESTÁ O NO LOGGEADO
   */
  isLoggedIn() {
    return localStorage.getItem('user_key') !== null;
  }

  /**
   * MÉTODO PARA OBTENER EL ID DE UN USUARIO PARA PODER REALIZAR LOS REQUEST AL SERVIDOR
   */
  getUserKey() {
    const user_key = localStorage.getItem("user_key") ? localStorage.getItem("user_key") : '';
    return user_key;
  }

  /**
   * MÉTODO PARA TOMAR LOS DATOS DEL USUARIO EN UNA VARIABLE GLOBAL DISPONIBLE PARA TODA LA APLICACIÓN:
   */
  public setUserProfile() {
    this.userProfile = this.getStoredUserData();
  }

  /**
   * MÉTODO PARA OBTENER EL OBJETO USER PROFILE QUE CONTIENE LOS DATOS DEL USUARIO DESENCRIPTADOS:
   */
  public getUserProfile() {
    return this.userProfile;
  }
}
