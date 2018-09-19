import { Injectable, EventEmitter } from '@angular/core';
import { User } from '../models/user';
import { Person } from '../models/person';
import { REST_SERV } from '../rest-url/rest-servers';
import { CrytoGen } from '../tools/crypto-gen';
import { Http, Headers, Response } from '@angular/http';
import { BackSyncService } from './back-sync.service';
import { Province } from '../models/province';
import { Canton } from '../models/canton';
import { Parroquia } from '../models/parroquia';
import { DateManager } from '../tools/date-manager';
import { throwError } from 'rxjs';

declare var writeData: any;
declare var readAllData: any;
declare var deleteItemData: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isFetchedProvince: boolean;
  private isFetchedCanton: boolean;
  private isFetchedParroquia: boolean;
  private isPatchedUser: boolean;

  public userProfile: User;
  public _userUpdate = new EventEmitter<boolean>();
  public pageLimit: number;

  constructor(
    private _http: Http,
    private _backSyncService: BackSyncService,
  ) {
    this.pageLimit = 5;
    this.isFetchedProvince = false;
    this.isFetchedCanton = false;
    this.isFetchedParroquia = false;
    this.isPatchedUser = false;
  }

  /**
   * MÉTODO PARA ALMACENAR EN EL LOCAL STORAGE DEL NAVEGADOR LAS CREDENCIALES PUBLICAS DEL USUARIO:
   */
  public storeUserCredentials(jsonUser: any) {
    localStorage.setItem('user_key', jsonUser.user_key);
    localStorage.setItem('user_id', jsonUser.user_id);
  }

  /**
   * MÉTODO PARA OBTENER LOS DATOS DEL USUARIO DESDE LA WEB:
   * @param id ID DEL USUARIO
   */
  public getRestUserProfile() {
    const reqHeaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this.getUserKey() });
    let userId = CrytoGen.decrypt(localStorage.getItem("user_id"));

    return this._http.get(REST_SERV.userUrl + "/" + userId, { headers: reqHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const userJson = response.json().data;
        this.updateUserData(userJson);

        console.log("[LUKASK USER SERVICE] - USER PROFILE FROM WEB", this.getUserProfile());
        return true;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error);
      });
  }

  /**
   * MÉTODO PARA OBTENER LA LISTA DE USUARIOS QUE HAN APOYADO PUBLICACIONES O COMENTARIOS:
   * @param relevanceType ID-PUBLICACIÓN O ID-COMMENTARIO
   * @param comRelevance PARA INDICAR QUE SE NECESITA UNA LISTA DE RELEVANCIAS DE UN COMENTARIO
   * @param pagePattern PATTERN PARA LA SIGUIENTE PÁGINA
   * @param moreSupps PARA CARGAR MAS REGISTROS BAJO DEMANDA
   */
  public getUserSupporters(relevanceType: string, comRelevance: boolean, pagePattern: string = null, moreSupps: boolean = false) {
    const reqHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this.getUserKey()
    });

    let flag = true;

    if (moreSupps == true && !pagePattern) {
      flag = false;
    }

    if (flag) {
      let filter = ((!comRelevance) ? "/?pub_id=" + relevanceType : "/?com_id=" + relevanceType) + ((pagePattern && moreSupps == true) ? pagePattern : "&limit=" + this.pageLimit) + ((comRelevance) ? "&com_relevance=true" : "");

      return this._http.get(REST_SERV.userUrl + filter, { headers: reqHeaders, withCredentials: true }).toPromise()
        .then((response: Response) => {
          const respJson = response.json().supporters;
          const pattern = respJson.next;
          const supps = respJson.results;
          let transformedSupps: User[] = [];
          for (let sup of supps) {
            transformedSupps.push(this.extractUserJson(sup));
          }

          console.log("[LUKASK USER SERVICE] - SUPPORTER USERS FROM WEB", transformedSupps);
          return { supporters: transformedSupps, pagePattern: pattern };
        })
        .catch((error: Response) => {
          if (error.json().code == 401) {
            localStorage.clear();
          }
          console.log(error);
        });
    }
  }

  /**
   * MÉTODO PARA ALMACENAR EN INDEXED DB EL ID DE USUARIO LOGEADO:
   * @param userId 
   */
  private storeUserIndexedTable(userKey: any, userData: any) {
    if ('indexedDB' in window) {
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
   * MÉTODO PARA ACTUALIZAR UN PERFIL DE USUARIO EN EL BACKEND O EN SU DEFECTO PARA BACK SYNC:
   */
  public saveUser(user: User) {
    return this.sendUser(user).then(
      (response: any) => {
        this.isPatchedUser = false;
        return response;
      }).catch(err => {
        if (!this.isPatchedUser && !navigator.onLine) {
          this._backSyncService.storeForBackSync('sync-user-profile', 'sync-update-user', this.mergeJsonData(user));
          if (navigator.serviceWorker.controller) {
            return true;
          }
        }
        
        this.isPatchedUser = false;
        throw err;
      });
  }

  /**
   * MÉTODO PARA EDITAR LOS DATOS DEL PERFIL
   */
  public sendUser(user: User) {
    let userFormData: FormData = this.mergeFormData(user);
    return this.patchUserClient(userFormData)
      .then((response: any) => {
        this.updateUserData(response);
        this.isPatchedUser = true;
        return response;
      }).catch(err => {
        throw err;
      });
  }

  /**
   * MÉTODO PARA CREAR UN OBJETO JAVASCRIPT MAS REDUCIDO
   * @param user 
   */
  private mergeJsonData(user: User) {
    return {
      id: new Date().toISOString(),
      user_id: user.id,
      email: user.username,
      password: user.password,
      person_id: user.person.id_person,
      age: user.person.age,
      identification_card: user.person.identification_card,
      name: user.person.name,
      last_name: user.person.last_name,
      telephone: user.person.telephone,
      address: user.person.address,
      cell_phone: user.person.cell_phone,
      birthdate: user.person.transBirthDate,
      profile_img: user.file,
      profile_img_name: user.fileName,
      province: user.person.parroquia.canton.province.id_province,
      canton: user.person.parroquia.canton.id_canton,
      parroquia: user.person.parroquia.id_parroquia,
      is_active: true
    };
  }
  /**
    * MÉTODO PARA TOMAR LOS DATOS QUE BIENEN POR POST PARA REGISTRO
    */
  mergeFormData(user: User) {
    let formData = new FormData();

    formData.append('id', user.id);
    formData.append('email', user.username);
    formData.append('password', user.password);
    formData.append('person_id', user.person.id_person);
    formData.append('age', user.person.age + "");
    formData.append('identification_card', user.person.identification_card);
    formData.append('name', user.person.name);
    formData.append('last_name', user.person.last_name);
    formData.append('telephone', user.person.telephone);
    formData.append('address', user.person.address);
    formData.append('cell_phone', user.person.cell_phone);
    formData.append('birthdate', user.person.transBirthDate);
    formData.append('user_file', user.file, user.fileName);
    formData.append('province', user.person.parroquia.canton.province.id_province);
    formData.append('canton', user.person.parroquia.canton.id_canton);
    formData.append('parroquia', user.person.parroquia.id_parroquia);
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
          if (xhr.status === 201) {
            let resp = JSON.parse(xhr.response).data;
            resolve(resp);
          }
          else {
            if (xhr.status == 401) {
              localStorage.clear();
            }
            else if (xhr.status == 0) {
              reject(xhr.response);
            }
            else {
              reject(JSON.parse(xhr.response));
            }
          }
        }
      };
      xhr.open("post", REST_SERV.signUrl, true);
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
    jsonUser.profile_path = jsonUser.profile_path.indexOf("http") !== -1 || jsonUser.profile_path.indexOf("https") !== -1 ? jsonUser.profile_path : REST_SERV.mediaBack + jsonUser.profile_path;
    user = new User(jsonUser.email, '', jsonUser.profile_path, jsonUser.is_active, null, null, jsonUser.id);
    user.person = new Person(jsonUser.person.id_person, jsonUser.person.age, jsonUser.person.identification_card, jsonUser.person.name, jsonUser.person.last_name, jsonUser.person.telephone, jsonUser.person.address, jsonUser.person.active, jsonUser.person.birthdate, jsonUser.person.cell_phone, null, DateManager.convertStringToDate(jsonUser.person.birthdate));

    //PROVISIONAL
    user.person.parroquia.id_parroquia = jsonUser.person.location.parish.id;
    user.person.parroquia.name = jsonUser.person.location.parish.description;

    user.person.parroquia.canton.id_canton = jsonUser.person.location.canton.id;
    user.person.parroquia.canton.name = jsonUser.person.location.canton.description;

    user.person.parroquia.canton.province.id_province = jsonUser.person.location.province.id;
    user.person.parroquia.canton.province.name = jsonUser.person.location.province.description;
    ////

    return user;
  }

  /**
   * MÉTODO PARA OBTENER LA INFORMACIÓN DEL PERFIL DE USUARIO Y DESENCRIPTARLO
   */
  getStoredUserData() {
    let storedData = localStorage.getItem('user_data');
    let user;
    if (storedData) {
      let userData = CrytoGen.decrypt(storedData);
      user = this.extractUserJson(JSON.parse(userData));
    }

    return user;
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
   * MÉTODO PARA ELIMINAR EL OBJETO USER PROFILE LUEGO DE DESLOGEARSE:
   */
  public delUserProfile() {
    this.userProfile = null;
  }

  /**
   * MÉTODO PARA OBTENER EL OBJETO USER PROFILE QUE CONTIENE LOS DATOS DEL USUARIO DESENCRIPTADOS:
   */
  public getUserProfile() {
    if (!this.userProfile) {
      this.userProfile = this.getStoredUserData();
    }
    return this.userProfile;
  }

  /**
   * MÉTODO PARA CARGAR LOS DATOS DEL USUARIO DESDE LA WEB O EN SU DEFECTO DESDE LOCAL STORAGE: 
   */
  public getRevalidatedUser() {
    return this.getRestUserProfile().then((resp) => {
      this.userProfile = null;
      return this.getUserProfile();
    });
  }

  /**
   * MÉTODO PARA ENVIAR MEDIANTE POST LOS DATOS DEL PERFIL
   * @param userFormData 
   */
  patchUserClient(userFormData: FormData) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let resp = JSON.parse(xhr.response).data;
            resolve(resp);
          }
          else {
            if (xhr.status == 401) {
              localStorage.clear();
            }
            if (xhr.status == 0) {
              reject(xhr.response);
            }
            else {
              reject(JSON.parse(xhr.response));
            }
          }
        }
      };
      xhr.open("post", REST_SERV.userUrl + "/" + userFormData.get("id"), true);
      xhr.setRequestHeader('X-Access-Token', this.getUserKey());
      xhr.withCredentials = true;
      xhr.send(userFormData);
    });
  }

  /**
   * MÉTODO PARA REGISTRAR LOS DATOS DEL PERFIL
   */
  public registerUser(user: User) {
    let userFormData: FormData = this.mergeFormData(user);
    return this.postUserClient(userFormData)
      .then((response: any) => {
        console.log(response);

        return true;
      });
  }

  /**
   * MÉTODO PARA OBTENER LAS PROVINCIAS SEA DE LA WEB O DE LA CACHÉ
   * */
  public getProvinceList() {
    return this.getProvinceWeb().then((webProvince: Province[]) => {
      if (!this.isFetchedProvince) {
        return this.getProvinceCache().then((cacheProvince: Province[]) => {
          return cacheProvince;
        });
      }
      else {
        this.isFetchedProvince = false;
      }

      return webProvince;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      console.log(error.json());
    });
  }

  /**
   * MÉTODO PARA CARGAR LAS PROVINCIAS DESDE LA WEB
   */
  private getProvinceWeb() {
    const qTheaders = new Headers({ 'Content-Type': 'application/json' });

    return this._http.get(REST_SERV.provinceUrl, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const provinces = response.json().data;
        let transformedProvinces: Province[] = [];
        for (let prov of provinces) {
          transformedProvinces.push(new Province(prov.id_province, prov.description_province));
        }
        this.isFetchedProvince = true;
        console.log("[LUKASK USER SERVICE] - PROVINCIAS FROM WEB", transformedProvinces);
        return transformedProvinces;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error.json());
      });
  }

  /**
   * MÉTODO PARA CARGAR LAS PROVINCIAS DESDE LA WEB
   */
  private getProvinceCache() {
    if ('indexedDB' in window) {
      return readAllData('province')
        .then((provinces) => {
          let transformedProvinces: Province[] = [];
          for (let prov of provinces) {
            transformedProvinces.push(new Province(prov.id_province, prov.description_province));
          }

          console.log("[LUKASK USER SERVICE] - PROVINCIAS FROM CACHE", transformedProvinces);
          return transformedProvinces;
        });
    }
    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  /**
   * MÉTODO PARA OBTENER LOS CANTONES DE UNA PROVINCIA SEA DE LA WEB O DE LA CACHÉ
   * */
  public getCantonList(id_provincia: string) {
    return this.getCantonWeb(id_provincia).then((webCanton: Canton[]) => {
      if (!this.isFetchedCanton) {
        return this.getCantonCache(id_provincia).then((cacheCanton: Canton[]) => {
          return cacheCanton;
        });
      }
      else {
        this.isFetchedCanton = false;
      }

      return webCanton;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      console.log(error.json());
    });
  }

  /**
   * MÉTODO PARA CARGAR LOS CANTONES DE UNA PROVINCIA ESPECÍFICA DESDE LA WEB
   * @param id_provincia 
   */
  private getCantonWeb(id_provincia: string) {
    const qTheaders = new Headers({ 'Content-Type': 'application/json' });
    return this._http.get(REST_SERV.cantonUrl + "/?province_id=" + id_provincia, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const cantones = response.json().data;
        let transformedCantones: Canton[] = [];
        for (let canton of cantones) {
          transformedCantones.push(new Canton(canton.id_canton, canton.description_canton));
        }
        this.isFetchedCanton = true;

        console.log("[LUKASK USER SERVICE] - CANTONES FROM WEB", transformedCantones);
        return transformedCantones;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error.json());
      });
  }

  /**
   * MÉTODO PARA CARGAR LOS CANTONES DE UNA PROVINCIA ESPECÍFICA DESDE LA CACHÉ
   * @param id_provincia 
   */
  private getCantonCache(id_provincia: string) {
    if ('indexedDB' in window) {
      return readAllData('canton')
        .then((cantones) => {
          let transformedCantones: Canton[] = [];
          for (let canton of cantones) {
            if (canton.province == id_provincia) {
              transformedCantones.push(new Canton(canton.id_canton, canton.description_canton));
            }
          }
          console.log("[LUKASK USER SERVICE] - CANTONES FROM CACHE", transformedCantones);
          return transformedCantones;
        });
    }
    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  /**
   * MÉTODO PARA OBTENER LAS PARROQUIAS SEA DE LA WEB O DE LA CACHÉ
   * */
  public getParroquiaList(canton_id: any) {
    return this.getParroquiaWeb(canton_id).then((webParroquia: Parroquia[]) => {
      if (!this.isFetchedParroquia) {
        return this.getParroquiaCache(canton_id).then((cacheParroquia: Canton[]) => {
          return cacheParroquia;
        });
      }
      else {
        this.isFetchedCanton = false;
      }

      return webParroquia;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      console.log(error.json());
    });
  }

  /**
   * MÉTODO PARA CARGAR LAS PARROQUIAS DE UN CANTÓN ESPECÍFICO DESDE LA WEB
   * @param canton_id 
   */
  private getParroquiaWeb(canton_id: string) {
    const qTheaders = new Headers({ 'Content-Type': 'application/json' });
    return this._http.get(REST_SERV.parroquiaUrl + "/?canton_id=" + canton_id, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const parroquias = response.json().data;
        let transformedParroquias: Parroquia[] = [];
        for (let parroq of parroquias) {
          transformedParroquias.push(new Parroquia(parroq.id_parish, parroq.description_parish));
        }
        this.isFetchedParroquia = true;

        console.log("[LUKASK USER SERVICE] - PARROQUIAS FROM WEB", transformedParroquias);
        return transformedParroquias;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error.json());
      });
  }

  /**
   * MÉTODO PARA CARGAR LAS PARROQUIAS DE UN CANTÓN ESPECÍFICO DESDE LA CACHÉ
   * @param canton_id 
   */
  private getParroquiaCache(canton_id: string) {
    if ('indexedDB' in window) {
      return readAllData('parroquia')
        .then((parroquias) => {
          let transformedParroquias: Parroquia[] = [];
          for (let parroq of parroquias) {
            if (parroq.canton == canton_id) {
              transformedParroquias.push(new Parroquia(parroq.id_parish, parroq.description_parish));
            }
          }
          console.log("[LUKASK USER SERVICE] - PARROQUIAS FROM CACHE", transformedParroquias);
          return transformedParroquias;
        });
    }
    return new Promise((resolve, reject) => {
      reject(null);
    });
  }
}
