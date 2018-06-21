import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Person } from '../models/person';
import { REST_SERV } from '../rest-url/rest-servers';
import { CrytoGen } from '../tools/crypto-gen';

declare var writeData: any;
declare var readAllData: any;
declare var deleteItemData: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userProfile: User;

  constructor() { }

  /**
   * MÉTODO PARA ALMACENAR EN EL NAVEGADOR LA INFORMACIÓN DEL PERFIL DE USUARIO:
   */
  storeUserData(jsonUser: any) {
    let cryptoData = CrytoGen.encrypt(JSON.stringify(jsonUser.user_profile));

    this.userProfile = this.extractUserJson(jsonUser.user_profile);

    localStorage.setItem('user_id', jsonUser.user_id);
    localStorage.setItem('user_data', cryptoData);

    if ('serviceWorker' in navigator && 'SyncManager' in window && 'indexedDB' in window) {
      readAllData('user')
        .then((tableData) => {
          if (tableData.length == 0) {
            writeData('user', JSON.parse(JSON.stringify({ id: new Date().toISOString(), user_id: jsonUser.user_id })));
          }
          else {
            for (let user of tableData) {
              deleteItemData('user', user.id)
                .then(() => {
                  writeData('user', JSON.parse(JSON.stringify({ id: new Date().toISOString(), user_id: jsonUser.user_id })));
                });
            }
          }
        });
    }
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
    return localStorage.getItem('user_id') !== null;
  }

  /**
   * MÉTODO PARA OBTENER EL ID DE UN USUARIO PARA PODER REALIZAR LOS REQUEST AL SERVIDOR
   */
  getUserId() {
    const user_id = localStorage.getItem("user_id") ? localStorage.getItem("user_id") : '';
    return user_id;
  }

  /**
   * MÉTODO PARA EXTRAER LOS DATOS DE USUARIO DE UN JSON STRING Y GUARDARLO EN UN OBJETO DE TIPO MODELO USER
   * @param jsonUser ES EL JSON STRING QUE CONTIENE LOS DATOS DEL USUARIO
   */
  extractUserJson(jsonUser: any) {
    let user: User;

    jsonUser.media_profile = (jsonUser.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack + jsonUser.media_profile : jsonUser.media_profile;
    user = new User(jsonUser.email, '', jsonUser.media_profile);
    user.person = new Person(jsonUser.person.id_person, jsonUser.person.age, jsonUser.person.identification_card, jsonUser.person.name, jsonUser.person.last_name, jsonUser.person.telephone, jsonUser.person.address);

    return user;
  }

  /**
   * MÉTODO PARA TOMAR LOS DATOS DEL USUARIO EN UNA VARIABLE GLOBAL DISPONIBLE PARA TODA LA APLICACIÓN:
   */
  setUserProfile() {
    this.userProfile = this.getStoredUserData();
  }

  /**
   * MÉTODO PARA OBTENER EL OBJETO USER PROFILE QUE CONTIENE LOS DATOS DEL USUARIO DESENCRIPTADOS:
   */
  getUserProfile() {
    return this.userProfile;
  }
}
