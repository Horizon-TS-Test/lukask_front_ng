import { Injectable, OnDestroy } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { throwError, Subscription, BehaviorSubject, Observable } from 'rxjs';

import { REST_SERV } from '../rest-url/rest-servers';
import { QuejaType } from '../models/queja-type';
import { Publication } from '../models/publications';
import { Media } from '../models/media';
import { User } from '../models/user';
import { UserService } from './user.service';
import { SocketService } from './socket.service';
import { ArrayManager } from '../tools/array-manager';
import { BackSyncService } from './back-sync.service';
import * as lodash from 'lodash';

declare var readAllData: any;
declare var writeData: any;
declare var deleteItemData: any;
declare var verifyStoredData: any;

@Injectable({
  providedIn: 'root'
})
export class QuejaService implements OnDestroy {

  private subscriptor: Subscription;

  private mapSubject = new BehaviorSubject<string>(null);
  map$: Observable<string> = this.mapSubject.asObservable();

  private pubDetailSub = new BehaviorSubject<Publication>(null);
  pubDetail$: Observable<Publication> = this.pubDetailSub.asObservable();

  private subject = new BehaviorSubject<Publication[]>(null);
  pubs$: Observable<Publication[]> = this.subject.asObservable();

  private isFetchedQtype: boolean;
  private isFetchedPubs: boolean;
  private isFetchedPub: boolean;
  private pagePattern: string;
  private isPostedPub: boolean;
  private isUpdatedTrans: boolean;

  public DEFAULT_LIMIT: number = 5;
  public ALL: string = "all";

  public pubList: Publication[];
  public pubFilterList: Publication[];

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

    this.listenToSocket();
  }

  /**
   * MÉTODO PARA NOTIFICAR A LOS OBSERVADORES LA LISTA DE PUBLICACIONES:
   * @param pubList 
   */
  public loadPubs(pubList: Publication[]) {
    this.subject.next(pubList);
  }

  /**
   * MÉTODO PARA CAMBIAR EL ESTADO DE UNA PUBLICACIÓN CUANDO SE HA DADO APOYO EN MODO OFFLINE:
   * @param pub 
   */
  public changePubOffRelevance(pub: Publication) {
    let currentPub = this.pubList.find(currPub => currPub.id_publication === pub.id_publication);
    ArrayManager.backendServerSays("UPDATE", this.pubList, currentPub, pub);
    this.loadPubs(this.pubList);
  }

  /**
   * MÉTODO PARA CONSUMIR EL END POINT PARA OBTENER LA LISTA DE TIPOS DE QUEJAS:
   */
  getQuejTypeWeb() {
    const qTheaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._userService.getUserKey() });

    return this._http.get(REST_SERV.qTypeUrl, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const qtypes = response.json().data;
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

  /**
   * MÉTODO PARA OBTENER LA LISTA DE TIPOS DE QUEJAS DESDE LA MEMORIA CACHÉ:
   */
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

  /**
   * MÉTODO PARA CARGAR LA LISTA DE TIPOS DE QUEJA SEA DE LA WEB O DE LA CACHÉ
   */
  getQtypeList() {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getQuejTypeWeb().then((webQtype: QuejaType[]) => {

      if (!this.isFetchedQtype) {
        return this.getQuejTypeCache().then((cacheQtype: QuejaType[]) => {
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
    });
  }

  /**
   * MÉTODO PARA CARGAR PUBLICACIONES BAJO DEMANDA DESDE LA WEB:
   */
  private getPubsWebByPage(morePubs: boolean = false) {
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

          this.isFetchedPubs = true;
          console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM WEB", transformedPubs);
          return transformedPubs;
        }).catch((error: Response) => {
          if (error.json().code == 401) {
            localStorage.clear();
          }
          return throwError(error.json());
        });
    }
    return new Promise((resolve, reject) => {
      this.isFetchedPubs = true;
      resolve([]);
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

  /**
   * MÉTODO PARA CARGAR LA LISTA DE PUBLICACIONES SEA DESDE LA WEB O DE LA CACHÉ
   */
  getPubList() {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getPubsWebByPage().then((webPubs: Publication[]) => {
      this.pubList = webPubs;

      if (!this.isFetchedPubs) {
        return this.getPubsCacheByPage().then((cachePubs: Publication[]) => {
          this.pubList = cachePubs;
          ////PARA AGREGAR LAS RELEVANCIAS EN MODO OFFLINE:
          this.getOfflinePubRelevances(this.pubList);
          ////

          //PARA CARGAR LAS PUBLICACIONES QUE ESTÁN PENDIENTES DE ENVIAR AL BACKEND:
          this.getOfflinePubsCache()
          ///
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
          ////PARA AGREGAR LAS RELEVANCIAS EN MODO OFFLINE:
          this.getOfflinePubRelevances(cachePubs);
          ////
          this.pubList = this.pubList.concat(cachePubs);
          return this.pubList;
        });
      }
      else {
        this.isFetchedPubs = false;
      }

      return this.pubList;
    }).catch((error: Response) => {
      console.log("error", error);
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }

  /**
   * MÉTODO PARA RETORNAR EL OBJETO QUE CONTIENE LA LISTA DE PUBLICACIONES
   */
  getPubListObj() {
    return this.pubList;
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL OBJETO ARRAY DE PUBLICACIONES
   * @param pubs NUEVA LISTA DE PUBLICACIONES
   */
  setPubList(pubs: Publication[]) {
    this.pubList = pubs;
  }

  /**
   * MÉTODO PARA AÑADIR UNA PUBLICACIÓN A LA LISTA DE PUBS
   * @param pub 
   */
  addPubToPubList(pub: Publication) {
    this.pubList.push(pub);
  }

  /**
   * MÉTODO PARA CREAR UN OBJETO JAVASCRIPT A PARTIR DE UNO DE TIPO PUBLICACION
   * @param queja 
   */
  mergeJSONData(queja: Publication) {
    var json = {
      id: queja.id_publication,
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
      userId: this._userService.getUserProfile().id,
    }

    for (let med of queja.media) {
      json.media_files.push({ file: med.file, fileName: med.fileName, fileUrl: med.url });
    }
    /////

    return json;
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO COMENTARIO O RESPUESTA EN EL BACKEND O EN SU DEFECTO PARA BACK SYNC:
   */
  public savePub(pub: Publication) {
    return this.sendQueja(pub).then((response) => {
      return response;
    }).catch(err => {
      if (!this.isPostedPub && !navigator.onLine) {
        pub.id_publication = new Date().toISOString();
        this._backSyncService.storeForBackSync('sync-pub', 'sync-new-pub', this.mergeJSONData(pub))
        if (navigator.serviceWorker.controller) {
          pub.isOffline = true;
          pub.user = this._userService.getUserProfile();
          this.pubList.splice(0, 0, pub);
          this.loadPubs(this.pubList);
          return true;
        }
      }

      this.isPostedPub = false;
      throw err;
    });
  }

  /**
   * MÉTODO PARA ENVIAR UN FORM DATA HACIA EL MIDDLEWARE EN UN POST REQUEST:
   * @param queja 
   */
  private sendQueja(queja: Publication) {
    let quejaFormData: FormData = this.mergeFormData(queja);
    return this.postQuejaClient(quejaFormData)
      .then((response) => {
        this.updatePubList(response, "CREATE");
        this.isPostedPub = true;
        return response;
      }).catch(err => {
        throw err;
      });
  }

  /**
   * MÉTODO PARA EXTRAER LOS DATOS DE PUBLICACION DE UN OBJETO JSON
   * @param pubJson 
   */
  public extractPubJson(pubJson) {
    let pub: Publication;
    let usr: User;
    let type: QuejaType;

    usr = this._userService.extractUserJson(pubJson.user_register);
    type = new QuejaType(pubJson.type_publication, pubJson.type_publication_detail);

    pub = new Publication(pubJson.id_publication, parseFloat(pubJson.latitude), parseFloat(pubJson.length), pubJson.detail, pubJson.date_publication, pubJson.priority_publication, pubJson.active, type, usr, pubJson.location, pubJson.count_relevance, pubJson.user_relevance, pubJson.address, pubJson.is_trans, pubJson.trans_done);
    for (let med of pubJson.medios) {
      //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
      med.media_path = (med.media_path.indexOf("http") !== -1 || med.media_path.indexOf("https") !== -1 ? "" : REST_SERV.mediaBack) + med.media_path;
      ////
      pub.media.push(new Media(med.id_multimedia, med.format_multimedia, med.media_path));
    }

    return pub;
  }

  /**
   * MÉTODO PARA CREAR UN OBJETO DE TIPO FORM DATA A PARTIR DE UNO DE TIPO PUBLICACION
   * @param queja 
   */
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
    formData.append('userId', this._userService.getUserProfile().id);

    for (let med of queja.media) {
      formData.append('media_files[]', med.file, med.fileName);
    }

    return formData;
  }

  /**
   * MÉTODO PARA POSTEAR UNA NUEVA QUEJA HACIA EL BACKEND
   * @param quejaFormData 
   */
  postQuejaClient(quejaFormData: FormData) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.response).data);
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

      xhr.open("post", REST_SERV.pubsUrl, true);
      xhr.setRequestHeader('X-Access-Token', this._userService.getUserKey());
      xhr.withCredentials = true;
      xhr.send(quejaFormData);
    });
  }

  /**
   * MÉTODO PARA OBTENER UNA PUBLICACION DADO SU ID, DESDE LA WEB
   * @param id 
   */
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

  /**
   * MÉTODO PARA OBTENER UNA PUBLICACION DADO SU ID, DESDE LA CACHÉ
   * @param id 
   */
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

  /**
   * MÉTODO PARA OBTENER UNA PUBLICACION DADO SU ID SEA DESDE LA WEB O LA CACHÉ
   * @param id 
   */
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
  private listenToSocket() {
    this.subscriptor = this._socketService.pubUpdate$.subscribe((socketPub: any) => {
      if (socketPub && this.pubList) {
        let stream = socketPub.stream;
        let action = socketPub.payload.action.toUpperCase();

        switch (stream) {
          case "publication":
            this.updatePubList(socketPub.payload.data, action);
            this.mapSubject.next(socketPub.payload.data.id_publication);
            this.loadPubs(this.pubList);
            break;
          case "actions":
            this.updateRelevanceNumber(socketPub.payload.data);
            break;
        }
      }
    }
    );
  }

  /**
   * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE PUBLICACIONES
   * @param pubJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
   * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
   */
  private updatePubList(pubJson: any, action: string) {
    let lastPub: Publication, newPub: Publication;
    let isDeleted: boolean = false;

    //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
    pubJson.user_register.profile_path = ((pubJson.user_register.profile_path.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + pubJson.user_register.profile_path;
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

    this.deleteOffPubAsoc(newPub);

    ArrayManager.backendServerSays(action, this.pubList, lastPub, newPub);
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL REGISTRO EN INDEXED-DB
   */
  private updateRelNumberIndexDb(pubId: string, newRelCount: number, userId: any) {
    readAllData("publication")
      .then(function (tableData) {
        let dataToSave;
        for (var t = 0; t < tableData.length; t++) {
          if (tableData[t].id_publication === pubId) {
            dataToSave = tableData[t];
            dataToSave.count_relevance = newRelCount;

            if (userId == dataToSave.user_register.id) {
              dataToSave.user_relevance = true;
            }

            deleteItemData("publication", tableData[t].id_publication)
              .then(function () {
                writeData("publication", dataToSave);
              });
            t = tableData.length;
          }
        }
      });
  }

  /**
   * MÉTODO PAR ACTUALIZAR EL NÚMERO DE RELEVANCIAS DE UNA PUBLICACIÓN:
   * @param actionData 
   */
  private updateRelevanceNumber(actionData: any) {
    var currentPub = this.pubList.find(pub => pub.id_publication === actionData.publication);

    if (currentPub) {
      this.getPubById(actionData.publication).then((newPub: Publication) => {
        ArrayManager.backendServerSays("UPDATE", this.pubList, currentPub, newPub);
        //ACTUALIZACIÓN PARA LA VISTA QUEJA DETAIL:
        this.pubDetailSub.next(newPub);
        ////

        this.updateRelNumberIndexDb(actionData.publication, newPub.relevance_counter, newPub.user.id);

        this.loadPubs(this.pubList);
      });
    }
  }

  /**
   * MÉTODO PARA EXTRAER LOS ATRIBUTOS DE LA LISTA DE PUBLICACIONES OFFLINE:
   */
  private extractOfflinePub(offCachePub) {
    let pub: Publication;
    let usr: User;
    let type: QuejaType;

    usr = this._userService.getUserProfile();
    type = new QuejaType(offCachePub.type_publication, '');

    pub = new Publication(offCachePub.id, offCachePub.latitude, offCachePub.longitude, offCachePub.detail, offCachePub.date_publication, '', true, type, usr, offCachePub.location, 0, false, offCachePub.address, offCachePub.is_trans, );
    for (let med of offCachePub.media_files) {
      pub.media.push(new Media('', '', med.fileUrl));
    }

    return pub;
  }

  /**
   * MÉTODO PARA OBTENER LAS PUBLICACIONES EN MODO OFFLINE DESDE LA CACHÉ
   * @param id 
   */
  public getOfflinePubsCache() {
    if ('indexedDB' in window) {
      readAllData('sync-pub')
        .then((offlinePubs) => {
          let offPub: Publication;
          ////
          for (let pub of offlinePubs) {
            offPub = this.extractOfflinePub(pub);
            offPub.isOffline = true;
            this.pubList.splice(0, 0, offPub);
          }
        });
    }
  }

  /**
   * MÉTODO PARA ELIMINAR UNA PUBLICACIÓN DE LA LISTA DE PUBS:
   * @param pubId 
   */
  public deletePub(pub: Publication) {
    this.pubList.splice(this.pubList.indexOf(pub), 1);
  }

  /**
   * MÉTODO PARA ELIMINAR UNA PUBLICACIÓN DE LA LISTA DE PUBS:
   * @param pubId 
   */
  public deleteOfflinePub(pub: Publication) {
    this.deletePub(pub);

    deleteItemData("sync-pub", pub.id_publication);
  }

  /**
   * MÉTODO PARA ELIMINAR LA PUBLICACIÓN OFFLINE, CUANDO YA SE HAYA GUARDADO EN EL SERVIDOR Y 
   * VENGA COMO RESPUESTA EN EL SOCKET.IO
   * @param newPub 
   */
  private deleteOffPubAsoc(newPub: Publication) {
    //PARA PODER ELIMINAR UNA PUB OFFLINE, LUEGO DE SER GUARDAR:
    for (let i = 0; i < this.pubList.length; i++) {
      if (this.pubList[i].isOffline) {
        let offDate = new Date(this.pubList[i].date_pub).getTime();;
        let comDate = new Date(newPub.date_pub.replace("T", " ").replace("Z", "")).getTime();;

        if (this.pubList[i].detail == newPub.detail && offDate.toString() == comDate.toString() && this.pubList[i].latitude == newPub.latitude && this.pubList[i].longitude == newPub.longitude && this.pubList[i].type.id == newPub.type.id && this.pubList[i].user.id == newPub.user.id) {
          this.pubList.splice(i, 1);
        }
      }
    }
    ////
  }

  /**
   * MÉTODO PARA OBTENER LAS RELEVANCIAS OFFLINE DESDE LA CACHÉ, PARA AÑADIR ESTILOS A LAS PUBLICACIONES,
   * AL MOMENTO DE RECARGAR LA PÁGIN ESTANDO EN MODO OFFLINE:
   */
  public getOfflinePubRelevances(pubList: Publication[]) {
    if ('indexedDB' in window) {
      readAllData('sync-relevance')
        .then((offPubRelevances) => {
          for (let pubRel of offPubRelevances) {
            if (!pubRel.action_parent) {
              for (let i = 0; i < pubList.length; i++) {
                if (pubList[i].id_publication == pubRel.id_publication) {
                  pubList[i].offRelevance = true;
                }
              }
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}
