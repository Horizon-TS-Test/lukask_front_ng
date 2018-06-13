import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { throwError } from 'rxjs';

import { REST_SERV } from '../rest-url/rest-servers';
import { QuejaType } from '../models/queja-type';
import { Publication } from '../models/publications';
import { Media } from '../models/media';
import { User } from '../models/user';
import { UserService } from './user.service';
import { Person } from '../models/person';
import { SocketService } from './socket.service';
import { ArrayManager } from '../tools/array-manager';
import * as lodash from 'lodash';

declare var readAllData: any;
declare var writeData: any;
declare var deleteItemData: any;

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

  public DEFAULT_LIMIT: number = 5;
  public ALL: string = "all";

  public pubList: Publication[];
  public pubFilterList: Publication[];
  public _mapEmitter = new EventEmitter<string>();

  constructor(
    private _http: Http,
    private _userService: UserService,
    private _socketService: SocketService
  ) {

    this.isFetchedQtype = false;
    this.isFetchedPubs = false;
    this.isFetchedPub = false;

    this.mainMediaJson = [{
      id_pub: '',
      medios: []
    }];
    this.listenToSocket();
  }

  getQuejTypeWeb() {
    const qTheaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._userService.getUserId() });

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

  getPubsWebByPage(morePubs: boolean = false) {
    const pubHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserId(),
      'Page-Pattern': this.pagePattern
    });
    let flag = true;

    if (morePubs && !this.pagePattern) {
      flag = false;
    }

    if (flag) {
      return this._http.get(REST_SERV.pubsUrl + "/?limit=" + this.DEFAULT_LIMIT, { headers: pubHeaders, withCredentials: true }).toPromise()
        .then((response: Response) => {
          const respJson = response.json().data;
          console.log(respJson);
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
      resolve(null);
    });
  }

  getPubsCache() {
    if ('indexedDB' in window) {
      return readAllData('publication')
        .then((pubs) => {
          //REF: https://www.npmjs.com/package/lodash
          //REF: https://stackoverflow.com/questions/43371092/use-lodash-to-sort-array-of-object-by-value
          let sortedPubs = lodash.orderBy(pubs, ['date_publication'], ['desc']);
          ////
          let transformedPubs: Publication[] = [];
          for (let pub of sortedPubs) {
            transformedPubs.push(this.extractPubJson(pub));
          }

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
        return this.getPubsCache().then((cachePubs: Publication[]) => {
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
      this.pubList = (webPubs) ? this.pubList.concat(webPubs) : this.pubList;

      if (!this.isFetchedPubs) {
        return this.getPubsCache().then((cachePubs: Publication[]) => {
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
      user_id: this._userService.getUserId(),
      id: new Date().toISOString(),
      latitude: queja.latitude,
      longitude: queja.longitude,
      detail: queja.detail,
      type_publication: queja.type.id,
      date_publication: queja.date_pub,
      location: queja.location,
      media_files: []
    }

    for (let med of queja.media) {
      json.media_files.push({ file: med.file, fileName: med.fileName });
    }
    /////

    return json;
  }

  sendQueja(queja: Publication) {
    /*if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((serviceW) => {
          var pub = this.mergeJSONData(queja);

          writeData('sync-pub', pub)
            .then(function () {
              serviceW.sync.register('sync-new-pub');
            })
            .then(function () {
              console.log("[LUKASK QUEJA SERVICE] - A new pub has been saved for syncing!!");
            })
            .catch(function (err) {
              console.log(err);
            });
        });
    }
    //IF THE WEB BROWSER DOESN'T SUPPORT OFFLINE SYNCRONIZATION:
    else {*/
    let quejaFormData: FormData = this.mergeFormData(queja);
    this.postQuejaClient(quejaFormData)
      .then(
        (response) => {
          this.updatePubList(response, "CREATE");
          console.log(response);
        },
        (err) => {
          console.log(err);
        }
      );
    //}
  }

  extractPubJson(pubJson) {
    let pub: Publication;
    let usr: User;
    let person: Person;
    let type: QuejaType;
    let medios: Media;

    //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
    pubJson.user_register.media_profile = ((pubJson.user_register.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + pubJson.user_register.media_profile;
    ////
    usr = new User(pubJson.user_register.email, '', pubJson.user_register.media_profile);
    usr.person = new Person(pubJson.user_register.person.id_person, pubJson.user_register.person.age, pubJson.user_register.person.identification_card, pubJson.user_register.person.name, pubJson.user_register.person.last_name, pubJson.user_register.person.telephone, pubJson.user_register.person.address, pubJson.user_register.person.active);
    type = new QuejaType(pubJson.type_publication, pubJson.type_publication_detail);

    pub = new Publication(pubJson.id_publication, pubJson.latitude, pubJson.length, pubJson.detail, pubJson.date_publication, pubJson.priority_publication, pubJson.active, type, usr, pubJson.location, pubJson.count_relevance, pubJson.user_relevance);
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
            resolve(JSON.parse(xhr.response).pub);
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
      xhr.setRequestHeader('X-Access-Token', this._userService.getUserId());
      xhr.withCredentials = true;
      xhr.send(quejaFormData);
    });
  }

  getPubWebById(id: string) {
    const _headers = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserId()
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
    const pubHeaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._userService.getUserId() });

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
   * MÉTODO PARA ESCUCHAR LAS ACTUALIZACIONES DEL CLIENTE SOCKET.IO
   * QUE TRAE CAMBIOS DESDE EL BACKEND (CREATE/UPDATE/DELETE)
   * Y ACTUALIZAR LA LISTA GLOBAL DE PUBLICACIONES CON LOS NUEVOS CAMBIOS
   */
  listenToSocket() {
    this._socketService._publicationUpdate.subscribe(
      (socketPub: any) => {
        let stream = socketPub.stream;
        let action = socketPub.payload.action.toUpperCase();
        let flag = 0;

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

    //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
    pubJson.user_register.media_profile = ((pubJson.user_register.media_profile.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + pubJson.user_register.media_profile;
    ////

    //STORING THE NEW DATA COMMING FROM SOMEWHERE IN INDEXED-DB
    if ('indexedDB' in window) {
      writeData('publication', pubJson);
    }
    ////

    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    lastPub = this.pubList.find(pub => pub.id_publication === pubJson.id_publication);

    if (action != ArrayManager.DELETE) {
      newPub = this.extractPubJson(pubJson);
    }

    ArrayManager.backendServerSays(action, this.pubList, lastPub, newPub);
  }

  /**
   * MÉTODO PARA ACTUALIZAR LA INFORMACIÓN DE LOS MEDIOS DE UNA PUBLICACIÓN
   * @param pubId ID DE LA PUBLICACIÓN A SER ACTUALIZADA SUS MEDIOS
   * @param mediaJson EL VALOR DEL MEDIO A SER AGREGADO
   */
  updateCachedPubMedia(pubId: string, mediaJson: any) {
    if ('indexedDB' in window) {
      let newPub: any, lastIndex: number;
      return readAllData('publication')
        .then((pubs) => {
          for (let i = 0; i < pubs.length; i++) {
            if (pubId == pubs[i].id_publication) {
              //NEXT IS FOR CLONNING THE JSON OBJECT PROPERLY:
              newPub = JSON.parse(JSON.stringify(pubs[i]));
              ////
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

    //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
    mediaJson.media_file = ((mediaJson.media_file.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + mediaJson.media_file;
    ////

    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    ownerPub = this.pubList.find(pub => pub.id_publication === mediaJson.id_publication);

    //UPDATING THE MEDIA DATA OF A PUBLICATION
    this.updateCachedPubMedia(mediaJson.id_publication, mediaJson);
    ////

    lastMedia = ownerPub.media.find(med => med.id === mediaJson.id_multimedia);

    if (action != ArrayManager.DELETE) {
      newMedia = new Media(mediaJson.id_multimedia, mediaJson.format_multimedia, mediaJson.media_file, null, null, null, mediaJson.id_publication);
    }

    ArrayManager.backendServerSays(action, ownerPub.media, lastMedia, newMedia);
  }
}
