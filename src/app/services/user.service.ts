import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Person } from '../models/person';
import { REST_SERV } from '../rest-url/rest-servers';
import { CrytoGen } from '../tools/crypto-gen';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  /**
   * MÉTODO PARA ALMACENAR EN EL NAVEGADOR LA INFORMACIÓN DEL 
   * PERFIL DE USUARIO LUEGO DE HABERSE LOGGEADO:
   */
  storeUserData(jsonUser: any) {
    let cryptoData = CrytoGen.encrypt(JSON.stringify(jsonUser.user_profile));

    localStorage.setItem('user_id', jsonUser.user_id);
    localStorage.setItem('user_data', cryptoData);
  }

  /**
   * MÉTODO PARA ACTUALIZAR EN EL NAVEGADOR LA INFORMACIÓN DEL PERFIL DE USUARIO:
   */
  updateUserData(jsonUser: any) {
    let cryptoData = CrytoGen.encrypt(JSON.stringify(jsonUser));
    localStorage.setItem('user_data', cryptoData);
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
    user = new User(jsonUser.email, '', jsonUser.media_profile, true, null, null, jsonUser.id);
    user.person = new Person(jsonUser.person.id_person, jsonUser.person.age, jsonUser.person.identification_card, jsonUser.person.name, jsonUser.person.last_name, jsonUser.person.telephone, jsonUser.person.address);

    return user;
  }

  /**
   * MÈTODO PARA EDITAR LOS DATOS DEL PERFIL
   */
  sendUser(user: User) {
    let userFormData: FormData = this.mergeFormData(user);
    this.postUserClient(userFormData)
      .then(
        (response: any) => {
          let usrData = response.userData;
          this.updateUserData(usrData);
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
    formData.append('user_file', user.file, user.fileName);
    formData.append('is_active', "true");

    return formData;
  }

  /**
   * MÈTODO PARA ENVIAR MEDIANTE POST LOS DATOS DEL PERFIL
   * @param userFormData 
   */
  postUserClient(userFormData: FormData) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let resp = JSON.parse(xhr.response);
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
      xhr.setRequestHeader('X-Access-Token', this.getUserId());
      xhr.withCredentials = true;
      xhr.send(userFormData);
    });
  }
}
