import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { throwError } from 'rxjs';

import { REST_SERV } from '../rest-url/rest-servers';
import { QuejaType } from '../models/queja-type';
import { Publication } from '../models/publications';
import { Media } from '../models/media';
import { User } from '../models/user';
import { UserService } from './user.service';
import { SocketService } from './socket.service';
import { ArrayManager } from '../tools/array-manager';
import * as lodash from 'lodash';
import { BackSyncService } from './back-sync.service';

declare var readAllData: any;
declare var writeData: any;
declare var deleteItemData: any;
declare var verifyStoredData: any;

@Injectable({
  providedIn: 'root'
})
export class QuejaService {

  private quejTypeList: QuejaType[];
  private isFetchedQtype: boolean;
  private isFetchedPubs: boolean;
  private isFetchedPub: boolean;
  private mainMediaJson: any;
  private pagePattern: string;
  private isPostedPub: boolean;
  private isUpdatedTrans: boolean;

  public DEFAULT_LIMIT: number = 5;
  public ALL: string = "all";

  public pubList: Publication[];
  public pubFilterList: Publication[];
  public _mapEmitter = new EventEmitter<string>();

  constructor(
    private _http: Http,
    private _userService: UserService,
    private _socketService: SocketService,
    private _backSyncService: BackSyncService
  ) {

    this.isFetchedQtype = false;
    this.isFetchedPubs = false;
    this.isFetchedPub = false;
    this.isUpdatedTrans = false;

    this.defineMainMediaArray();
    this.listenToSocket();
  }

  defineMainMediaArray() {
    this.mainMediaJson = [{
      id_pub: '',
      medios: []
    }];
  }

  getQuejTypeWeb() {
    const qTheaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._userService.getUserKey() });

    return this._http.get(REST_SERV.qTypeUrl, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const qtypes = response.json().data.results;
        let transformedQtypes: QuejaType[] = [];
        for (let type of qtypes) {
          transformedQtypes.push(new QuejaType(type.id_type_publication, type.description));
        }

        this.isFetchedQtype = true;
        console.log("[LUKASK QUEJA SERVICE] - QUEJA TYPES FROM WEB", transformedQtypes);
        return transformedQtypes;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  getQuejTypeCache() {
    if ('indexedDB' in window) {
      return readAllData('qtype')
        .then((qtypes) => {
          let transformedQtypes: QuejaType[] = [];
          for (let type of qtypes) {
            transformedQtypes.push(new QuejaType(type.id_type_publication, type.description));
          }

          console.log("[LUKASK QUEJA SERVICE] - QUEJA TYPES FROM CACHE", transformedQtypes);
          return transformedQtypes;
        });
    }

    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  getQtypeList() {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getQuejTypeWeb().then((webQtype: QuejaType[]) => {
      this.quejTypeList = webQtype;

      if (!this.isFetchedQtype) {
        return this.getQuejTypeCache().then((cacheQtype: QuejaType[]) => {
          this.quejTypeList = cacheQtype;
          return cacheQtype;
        });
      }
      else {
        this.isFetchedQtype = false;
      }

      return webQtype;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });;
  }

  /**
   * MÉTODO PARA CARGAR PUBLICACIONES BAJO DEMANDA DESDE LA WEB:
   */
  getPubsWebByPage(morePubs: boolean = false) {
    const pubHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserKey()
    });
    let flag = true;

    if (morePubs == true && !this.pagePattern) {
      flag = false;
    }

    if (flag) {
      return this._http.get(REST_SERV.pubsUrl + "/" + ((this.pagePattern && morePubs == true) ? this.pagePattern : "?limit=" + this.DEFAULT_LIMIT), { headers: pubHeaders, withCredentials: true }).toPromise()
        .then((response: Response) => {
          const respJson = response.json().data;
          this.pagePattern = respJson.next;
          const pubs = respJson.results;

          let transformedPubs: Publication[] = [];
          for (let i = 0; i < pubs.length; i++) {
            transformedPubs.push(this.extractPubJson(pubs[i]));
          }

          this.defineMainMediaArray();
          this.isFetchedPubs = true;
          console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM WEB", transformedPubs);
          return transformedPubs;
        }).catch((error: Response) => {
          console.log(error);
          if (error.json().code == 401) {
            localStorage.clear();
          }
          return throwError(error.json());
        });
    }
    return new Promise((resolve, reject) => {
      this.isFetchedPubs = true;
      resolve(null);
    });
  }

  /**
   * MÉTODO PARA CARGAR PUBLICACIONES BAJO DEMANDA DESDE LA CACHÉ:
   */
  getPubsCacheByPage() {
    if ('indexedDB' in window) {
      return readAllData('publication')
        .then((pubs) => {
          //REF: https://www.npmjs.com/package/lodash
          //REF: https://stackoverflow.com/questions/43371092/use-lodash-to-sort-array-of-object-by-value
          let sortedPubs = lodash.orderBy(pubs, ['date_publication'], ['desc']);
          ////
          let offset = 0;
          if (this.pagePattern) {
            offset = parseInt(this.pagePattern.substring(this.pagePattern.indexOf("=", this.pagePattern.indexOf("offset")) + 1));
          }
          let cont = 0;

          let transformedPubs: Publication[] = [];
          for (let i = 0; i < sortedPubs.length; i++) {
            if (i >= offset && cont < this.DEFAULT_LIMIT) {
              transformedPubs.push(this.extractPubJson(sortedPubs[i]));
              cont++;
            }
          }

          let size = sortedPubs.length;
          offset = (offset + this.DEFAULT_LIMIT < size) ? offset + this.DEFAULT_LIMIT : null;

          this.pagePattern = (offset) ? "?limit=" + this.DEFAULT_LIMIT + "&offset=" + offset : null;

          console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM CACHE", transformedPubs);
          return transformedPubs
        });
    }

    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  getPubList() {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getPubsWebByPage().then((webPubs: Publication[]) => {
      this.pubList = webPubs;

      if (!this.isFetchedPubs) {
        return this.getPubsCacheByPage().then((cachePubs: Publication[]) => {
          this.pubList = cachePubs;
          return cachePubs;
        });
      }
      else {
        this.isFetchedPubs = false;
      }

      return webPubs;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }

  /**
   * FUNCIÓN PARA OBTENER PUBLICACIONES BAJO DEMANDA A TRAVÉS DE UN PATTERN DE PAGINACIÓN:
   */
  getMorePubs() {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getPubsWebByPage(true).then((webPubs: Publication[]) => {
      this.pubList = (webPubs.length > 0) ? this.pubList.concat(webPubs) : this.pubList;

      if (!this.isFetchedPubs) {
        return this.getPubsCacheByPage().then((cachePubs: Publication[]) => {
          this.pubList = this.pubList.concat(cachePubs);
          return this.pubList;
        });
      }
      else {
        this.isFetchedPubs = false;
      }

      return this.pubList;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }

  getPubListObj() {
    return this.pubList;
  }

  setPubList(pubs: Publication[]) {
    this.pubList = pubs;
  }

  addPubToPubList(pub: Publication) {
    this.pubList.push(pub);
  }

  mergeJSONData(queja: Publication) {
    var json = {
      id: new Date().toISOString(),
      latitude: queja.latitude,
      longitude: queja.longitude,
      detail: queja.detail,
      type_publication: queja.type.id,
      date_publication: queja.date_pub,
      location: queja.location,
      address: queja.address,
      is_trans: queja.isTrans,
      trans_done: queja.transDone,
      media_files: [],
    }

    for (let med of queja.media) {
      json.media_files.push({ file: med.file, fileName: med.fileName });
    }
    /////

    return json;
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO COMENTARIO O RESPUESTA EN EL BACKEND O EN SU DEFECTO PARA BACK SYNC:
   */
  public savePub(pub: Publication) {
    return this.sendQueja(pub).then((response) => {
      if (!this.isPostedPub) {
        return this._backSyncService.storeForBackSync('sync-pub', 'sync-new-pub', this.mergeJSONData(pub));
      }
      else {
        this.isPostedPub = false;
      }

      return response;
    });
  }

  /**
   * MÉTODO PARA ENVIAR UN FORM DATA HACIA EL MIDDLEWARE EN UN POST REQUEST:
   * @param queja 
   */
  private sendQueja(queja: Publication) {
    let quejaFormData: FormData = this.mergeFormData(queja);
    return this.postQuejaClient(quejaFormData)
      .then(
        (response) => {
          this.updatePubList(response, "CREATE");
          this.isPostedPub = true;
          return response;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  extractPubJson(pubJson) {
    let pub: Publication;
    let usr: User;
    let type: QuejaType;

    usr = this._userService.extractUserJson(pubJson.user_register);
    type = new QuejaType(pubJson.type_publication, pubJson.type_publication_detail);

    pub = new Publication(pubJson.id_publication, pubJson.latitude, pubJson.length, pubJson.detail, pubJson.date_publication, pubJson.priority_publication, pubJson.active, type, usr, pubJson.location, pubJson.count_relevance, pubJson.user_relevance, pubJson.address, pubJson.is_trans, pubJson.trans_done);
    for (let med of pubJson.medios) {
      //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
      med.media_file = ((med.media_file.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + med.media_file;
      ////
      pub.media.push(new Media(med.id_multimedia, med.format_multimedia, med.media_file));
    }

    return pub;
  }

  mergeFormData(queja: Publication) {
    let formData = new FormData();

    formData.append('latitude', queja.latitude + "");
    formData.append('longitude', queja.longitude + "");
    formData.append('detail', queja.detail);
    formData.append('type_publication', queja.type.id);
    formData.append('date_publication', queja.date_pub);
    formData.append('location', queja.location);
    formData.append('address', queja.address);
    formData.append('is_trans', queja.isTrans + "");

    for (let med of queja.media) {
      formData.append('media_files[]', med.file, med.fileName);
    }

    return formData;
  }

  postQuejaClient(quejaFormData: FormData) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            console.log(JSON.parse(xhr.response));
            resolve(JSON.parse(xhr.response).data);
          }
          else {
            if (xhr.status == 401) {
              localStorage.clear();
            }
            reject(xhr.response);
          }
        }
      };

      xhr.open("post", REST_SERV.pubsUrl, true);
      xhr.setRequestHeader('X-Access-Token', this._userService.getUserKey());
      xhr.withCredentials = true;
      xhr.send(quejaFormData);
    });
  }

  getPubWebById(id: string) {
    const _headers = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserKey()
    });

    return this._http.get(REST_SERV.pubsUrl + "/" + id, { headers: _headers, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const pubJson = response.json().pub;
        let pub: Publication;
        pub = this.extractPubJson(pubJson);

        this.isFetchedPub = true;
        console.log("[LUKASK QUEJA SERVICE] - GETTING PUBLICATION FROM WEB BY ID", pub);
        return pub;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  getPubCacheById(pubId: string) {
    if ('indexedDB' in window) {
      return readAllData('publication')
        .then((pubs) => {
          let transformedPub: Publication;
          ////
          for (let pub of pubs) {
            if (pubId == pub.id_publication) {
              transformedPub = this.extractPubJson(pub);
            }
          }

          console.log("[LUKASK QUEJA SERVICE] - GETTING PUBLICATION FROM CACHE BY ID", transformedPub);
          return transformedPub;
        });
    }

    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  getPubById(id: string) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    let returnedPub: Publication;
    return this.getPubWebById(id).then((webPub: Publication) => {
      returnedPub = webPub;

      if (!this.isFetchedPub) {
        return this.getPubCacheById(id).then((cachePub: Publication) => {
          returnedPub = cachePub;
          return returnedPub;
        });
      }
      else {
        this.isFetchedPub = false;
      }
      return returnedPub;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }

  getPubsFilterWeb(city: string) {
    const pubHeaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._userService.getUserKey() });

    return this._http.get(REST_SERV.pubFilterUrl + "/" + city, { headers: pubHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const pubs = response.json().data.results;
        let transformedPubs: Publication[] = [];
        for (let i = 0; i < pubs.length; i++) {
          transformedPubs.push(this.extractPubJson(pubs[i]));
        }

        this.isFetchedPubs = true;
        console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM WEB WITH FILTER", transformedPubs);
        return transformedPubs;
      }).catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  getPubListFilter(city: string) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    let returnedPubs: Publication[];
    return this.getPubsFilterWeb(city).then((webPubs: Publication[]) => {
      returnedPubs = webPubs;
      /*if (!this.isFetchedPubs) {
        returnedPubs = this.getPubsCache();
      }*/
      this.pubFilterList = returnedPubs;
      return returnedPubs;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO COMENTARIO O RESPUESTA EN EL BACKEND O EN SU DEFECTO PARA BACK SYNC:
   */
  public updateTransmission(pubId: string, transDone: boolean) {
    return this.stopTransmission(pubId, transDone).then((response: any) => {
      if (!this.isUpdatedTrans) {
        return this._backSyncService.storeForBackSync('sync-trans', 'sync-stop-trans', { pubId: pubId, transDone: transDone });
      }
      else {
        this.isUpdatedTrans = false;
      }

      return response;
    });
  }

  /**
   * MÉTODO PARA ENVIAR UN FORM DATA HACIA EL MIDDLEWARE EN UN POST REQUEST:
   * @param queja 
   */
  private stopTransmission(pubId: string, transDone: boolean = true) {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserKey()
    });
    const requestBody = JSON.stringify({ pubId: pubId, stopTrans: transDone });

    return this._http.post(REST_SERV.pubsUrl + "/transmission/" + pubId, requestBody, { headers: requestHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        let respJson = response.json().data;
        console.log("respJson.trans_done: " + respJson.trans_done);
        if (response.status === 200) {
          return true;
        }
        this.isUpdatedTrans = true;

        return false;
      });
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS ACTUALIZACIONES DEL CLIENTE SOCKET.IO
   * QUE TRAE CAMBIOS DESDE EL BACKEND (CREATE/UPDATE/DELETE)
   * Y ACTUALIZAR LA LISTA GLOBAL DE PUBLICACIONES CON LOS NUEVOS CAMBIOS
   */
  listenToSocket() {
    this._socketService._publicationUpdate.subscribe(
      (socketPub: any) => {
        let stream = socketPub.stream;
        let action = socketPub.payload.action.toUpperCase();

        switch (stream) {
          case "publication":
            this.updatePubList(socketPub.payload.data, action);
            this._mapEmitter.emit(socketPub.payload.data.id_publication);
            break;
          case "multimedia":
            /**
             * LO SIGUIENTE ES USADO PARA PREVENIR LA ASINCRONÍA EN LA EJECUCIÓN DE LA FUNCIÓN
             * this.updatePubMediaList(?,?), YA QUE PUEDEN LLEGAR VARIOS MEDIOS DE UNA MISMA PUBLICACIÓN
             * AL MISMO TIEMPO.
             */
            let pubId = socketPub.payload.data.id_publication;
            let flag = 0;
            for (let mainMedia of this.mainMediaJson) {
              if (mainMedia.id_pub == pubId) {
                mainMedia.medios[mainMedia.medios.length] = socketPub.payload.data;
                flag = 1;
              }
            }
            if (flag == 0) {
              this.mainMediaJson[this.mainMediaJson.length] = {
                id_pub: socketPub.payload.data.id_publication,
                medios: [socketPub.payload.data]
              }
            }
            this.updatePubMediaList(socketPub.payload.data, action);
            break;
        }
      }
    );
  }

  /**
   * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE PUBLICACIONES
   * @param pubJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
   * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
   */
  updatePubList(pubJson: any, action: string) {
    let lastPub: Publication, newPub: Publication;
    let isDeleted: boolean = false;

    //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
    pubJson.user_register.media_profile = ((pubJson.user_register.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + pubJson.user_register.media_profile;
    ////

    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    lastPub = this.pubList.find(pub => pub.id_publication === pubJson.id_publication);

    if (action != ArrayManager.DELETE) {
      newPub = this.extractPubJson(pubJson);
    }
    else {
      isDeleted = true;
    }

    verifyStoredData('publication', pubJson, isDeleted);

    ArrayManager.backendServerSays(action, this.pubList, lastPub, newPub);
  }

  /**
   * MÉTODO PARA ACTUALIZAR LA INFORMACIÓN DE LOS MEDIOS DE UNA PUBLICACIÓN
   * @param pubId ID DE LA PUBLICACIÓN A SER ACTUALIZADA SUS MEDIOS
   * @param isDelete SI ES UN PROCESO DE ELIMINACIÓN O NO
   */
  updateCachedPubMedia(pubId: string, isDelete: boolean) {
    if ('indexedDB' in window) {
      let newPub: any;
      return readAllData('publication')
        .then((pubs) => {
          for (let i = 0; i < pubs.length; i++) {
            if (pubId == pubs[i].id_publication) {
              if (isDelete == false) {
                //NEXT IS FOR CLONNING THE JSON OBJECT PROPERLY:
                newPub = JSON.parse(JSON.stringify(pubs[i]));
                ////
              }
              deleteItemData('publication', pubId);
              i = pubs.length;
            }
          }

          if (newPub) {
            if (newPub.medios.length == 0) {
              for (let a = 0; a < this.mainMediaJson.length; a++) {
                if (this.mainMediaJson[a].id_pub == pubId) {
                  newPub.medios = this.mainMediaJson[a].medios;
                }
              }
            }
            else {
              let canWe = true;
              for (let a = 0; a < this.mainMediaJson.length; a++) {
                if (this.mainMediaJson[a].id_pub == pubId) {
                  for (let m = 0; m < this.mainMediaJson[a].medios.length; m++) {
                    for (let i = 0; i < newPub.medios.length; i++) {
                      if (newPub.medios[i].id_multimedia == this.mainMediaJson[a].medios[m].id_multimedia) {
                        newPub.medios[i] = this.mainMediaJson[a].medios[m];
                        canWe = false;
                        i = newPub.medios.length;
                      }
                    }
                    if (canWe) {
                      newPub.medios[newPub.medios.length] = this.mainMediaJson[a].medios[m];
                    }
                    else {
                      canWe = true;
                    }
                  }
                  a = this.mainMediaJson.length;
                }
              }
            }
            writeData('publication', newPub);
          }
        });
    }
  }

  /**
   * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE MEDIOS DE UNA PUBLICACIÓN
   * @param mediaJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
   * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
   */
  updatePubMediaList(mediaJson: any, action: string) {
    let ownerPub: Publication;
    let lastMedia: Media, newMedia: Media;
    let isDelete: boolean = false;

    //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
    mediaJson.media_file = ((mediaJson.media_file.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + mediaJson.media_file;
    ////

    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    ownerPub = this.pubList.find(pub => pub.id_publication === mediaJson.id_publication);


    lastMedia = ownerPub.media.find(med => med.id === mediaJson.id_multimedia);

    if (action != ArrayManager.DELETE) {
      isDelete = true;
      newMedia = new Media(mediaJson.id_multimedia, mediaJson.format_multimedia, mediaJson.media_file, null, null, null, mediaJson.id_publication);
    }

    //UPDATING THE MEDIA DATA OF A PUBLICATION
    this.updateCachedPubMedia(mediaJson.id_publication, isDelete);
    ////

    ArrayManager.backendServerSays(action, ownerPub.media, lastMedia, newMedia);
  }
}
