import { Injectable, OnDestroy } from '@angular/core';
import { SocketService } from './socket.service';
import { UserService } from './user.service';
import { Http, Headers, Response } from '@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { Publication } from '../models/publications';
import { QuejaService } from './queja.service';
import { throwError, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { ArrayManager } from '../tools/array-manager';
import { EersaClaim } from '../models/eersa-claim';
import { EersaClient } from '../models/eersa-client';
import { EersaLocation } from '../models/eersa-location';
import * as lodash from 'lodash';
import { PUB_TYPES } from '../config/pub-types';

declare var readAllData: any;
declare var verifyStoredData: any;
declare var deleteItemData: any;

@Injectable({
  providedIn: 'root'
})
export class UserPubsService implements OnDestroy {
  private subscriptor: Subscription;
  private userPubsSubject = new BehaviorSubject<Publication[]>(null);
  userPubs$: Observable<Publication[]> = this.userPubsSubject.asObservable();

  private userPubUpdateSubject = new BehaviorSubject<{ userPubJson: any, action: string }>(null);
  updatedUserPub$: Observable<{ userPubJson: any, action: string }> = this.userPubUpdateSubject.asObservable();

  private newOffUserPubSub = new BehaviorSubject<Publication>(null);
  newOffUserPub$: Observable<Publication> = this.newOffUserPubSub.asObservable();

  private userPubsReqSubject = new BehaviorSubject<boolean>(false);
  moreUserPubsRequest$: Observable<boolean> = this.userPubsReqSubject.asObservable();

  private isFetchedPubs: boolean;

  public DEFAULT_LIMIT: number = 5;
  public ALL: string = "all";

  constructor(
    private _userService: UserService,
    private _quejaService: QuejaService,
    private _socketService: SocketService,
    private _http: Http,
  ) {
    this.listenToSocket();
  }

  /**
   * METODO PARA SOLICITAR LA CARGA DE MAS PUBLICACIONES/RECLAMOS DE LOS USUARIOS:
   */
  public requestMoreUserPubs() {
    this.userPubsReqSubject.next(true);
  }

  /**
   * MÉTODO PARA NOTIFICAR A LOS OBSERVADORES LA LISTA DE PUBLICACIONES DEL USUARIO LOGGEADO:
   * @param pubList 
   */
  public loadUserPubs(pubList: Publication[]) {
    this.userPubsSubject.next(pubList);
  }

  /**
   * MÉTODO PARA NOTIFICAR A LOS OBSERVADORES UNA NUEVA PUBLICIACIÓN DE USUARIO ENTRANTE:
   * @param userPubData 
   */
  public loadUpdatedUserPub(userPubData: { userPubJson: any, action: string }) {
    this.userPubUpdateSubject.next(userPubData);
  }

  /**
   * MÉTODO PARA NOTIFICAR A LOS OBSERVADORES ACERCA DE UNA NUEVA PUBLICACION DE USUARIO INSERTADA DE FORMA OFFLINE:
   * @param newOffUserPub 
   */
  public loadOffUserPub(newOffUserPub: Publication) {
    this.newOffUserPubSub.next(newOffUserPub);
  }

  /**
   * MÉTODO PARA EXTRAER LOS DATOS DE PUBLICACION DE UN OBJETO JSON
   * @param userPubJson 
   */
  public extractUserPubJson(userPubJson) {
    let pub: Publication;
    pub = this._quejaService.extractPubJson(userPubJson);
    pub.eersaClaim.eersaClaimId = userPubJson.eersaClaimId;

    return pub;
  }

  /**
   * MÉTODO PARA CARGAR PUBLICACIONES BAJO DEMANDA DESDE LA WEB:
   */
  private getUserPubsWebByPage(pagePattern: string, pubOrClaim: boolean, morePubs: boolean = false) {
    const pubHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserKey()
    });
    let flag = true;
    let userPattern = '&user_id=' + this._userService.getUserProfile().id;

    if (morePubs == true && !pagePattern) {
      flag = false;
    }

    if (flag) {
      return this._http.get(REST_SERV.pubsUrl + "/" + (pagePattern && morePubs == true ? pagePattern : "?limit=" + this.DEFAULT_LIMIT) + userPattern + (pubOrClaim ? '&pub=true' : '&claim=true'), { headers: pubHeaders, withCredentials: true }).toPromise()
        .then((response: Response) => {
          const respJson = response.json().data;
          const pagePattern = respJson.next;
          const pubs = respJson.results;

          let transformedPubs: Publication[] = [];
          for (let i = 0; i < pubs.length; i++) {
            transformedPubs.push(this.extractUserPubJson(pubs[i]));
          }

          this.isFetchedPubs = true;
          console.log("[LUKASK USER PUBS SERVICE] - USER PUBLICATIONS FROM WEB", transformedPubs);
          return { userPubs: transformedPubs, pagePattern: pagePattern };
        }).catch((error: Response) => {
          if (error.json().code == 401) {
            localStorage.clear();
          }
          return throwError(error.json());
        });
    }
    return new Promise((resolve, reject) => {
      this.isFetchedPubs = true;
      resolve({ userPubs: [], pagePattern: pagePattern });
    });
  }

  /**
   * MÉTODO PARA CARGAR PUBLICACIONES BAJO DEMANDA DESDE LA CACHÉ:
   */
  private getUserPubsCacheByPage(pagePattern: string, pubOrClaim: boolean) {
    if ('indexedDB' in window) {
      return readAllData('user-pub')
        .then((pubs) => {
          //REF: https://www.npmjs.com/package/lodash
          //REF: https://stackoverflow.com/questions/43371092/use-lodash-to-sort-array-of-object-by-value
          let sortedPubs = lodash.orderBy(pubs, ['date_publication'], ['desc']);
          ////
          let offset = 0;
          if (pagePattern) {
            offset = parseInt(pagePattern.substring(pagePattern.indexOf("=", pagePattern.indexOf("offset")) + 1));
          }
          let cont = 0;

          let transformedPubs: Publication[] = [];
          let type = (pubOrClaim) ? PUB_TYPES.pub : PUB_TYPES.claim;
          for (let i = 0; i < sortedPubs.length; i++) {
            if (sortedPubs[i].type_publication_detail == type) {
              if (i >= offset && cont < this.DEFAULT_LIMIT) {
                transformedPubs.push(this.extractUserPubJson(sortedPubs[i]));
                cont++;
              }
            }
          }

          let size = sortedPubs.length;
          offset = (offset + this.DEFAULT_LIMIT < size) ? offset + this.DEFAULT_LIMIT : null;

          pagePattern = (offset) ? "?limit=" + this.DEFAULT_LIMIT + "&offset=" + offset : null;

          console.log("[USER PUBS SERVICE] - USER PUBLICATIONS FROM CACHE", transformedPubs);
          return { userPubs: transformedPubs, pagePattern: pagePattern };
        });
    }

    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  /**
   * METODO PARA EXTRAER LOS DATOS DE UN RECLAMO EERSA QUE HA SIDO GUARDADO EN MODO OFFLINE:
   * @param eersaClaimData EERSA CLAIM JSON DATA STORED IN INDEXBD
   */
  private extractOffEersaClaim(eersaClaimData: any) {
    let eersaClaim: EersaClaim;
    let eersaClient: EersaClient;
    let eersaLocation: EersaLocation;

    eersaClient = new EersaClient(eersaClaimData.nCuenta, eersaClaimData.nMedidor, null);
    eersaLocation = new EersaLocation(eersaClaimData.calle, eersaClaimData.idBarrio, eersaClaimData.referencia, eersaClaimData.descBarrio);

    eersaClaim = new EersaClaim(eersaClaimData.claimId, eersaClaimData.nPoste, eersaClient, eersaLocation, eersaClaimData.idTipo, eersaClaimData.detalleReclamo, eersaClaimData.descTipo);

    return eersaClaim;
  }

  /**
   * MÉTODO PARA EXTRAER LOS ATRIBUTOS DE LA LISTA DE PUBLICACIONES OFFLINE:
   */
  private extractOfflineUserPub(offCachePub: any) {
    let userPub: Publication;

    userPub = this._quejaService.extractOfflinePub(offCachePub);
    if (offCachePub.eersaClaim) {
      userPub.eersaClaim = this.extractOffEersaClaim(offCachePub.eersaClaim);
    }

    return userPub;
  }

  /**
   * MÉTODO PARA OBTENER LAS PUBLICACIONES EN MODO OFFLINE DESDE LA CACHÉ
   * @param id 
   */
  public getOfflinePubsCache(userPubs: Publication[]) {
    if ('indexedDB' in window) {
      return readAllData('sync-user-eersa-claim')
        .then((offlineUserPubs) => {
          let offUserPub: Publication;
          ////
          for (let pub of offlineUserPubs) {
            offUserPub = this.extractOfflineUserPub(pub);
            offUserPub.isOffline = true;
            userPubs.splice(0, 0, offUserPub);
          }
          return userPubs;
        });
    }

    return new Promise((resolve, reject) => {
      resolve(userPubs);
    });
  }

  /**
   * MÉTODO PARA CARGAR LA LISTA DE PUBLICACIONES SEA DESDE LA WEB O DE LA CACHÉ
   */
  public getUserPubList(pubOrClaim: boolean = true) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getUserPubsWebByPage(null, pubOrClaim).then((webPubData: { userPubs: Publication[], pagePattern: string }) => {
      if (!this.isFetchedPubs) {
        return this.getUserPubsCacheByPage(null, pubOrClaim).then((cachePubData: { userPubs: Publication[], pagePattern: string }) => {
          //PARA CARGAR LAS PUBLICACIONES QUE ESTÁN PENDIENTES DE ENVIAR AL BACKEND:
          return this.getOfflinePubsCache(cachePubData.userPubs).then((offUserPubs: Publication[]) => {
            return { userPubs: offUserPubs, pagePattern: cachePubData.pagePattern };
          });
          ///
        });
      }
      else {
        this.isFetchedPubs = false;
      }

      return webPubData;
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
  public getMoreUserPubs(pagePattern: string, userPubs: Publication[], pubOrClaim: boolean = true) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getUserPubsWebByPage(pagePattern, pubOrClaim, true).then((webPubData: { userPubs: Publication[], pagePattern: string }) => {
      userPubs = (webPubData.userPubs.length > 0) ? userPubs.concat(webPubData.userPubs) : userPubs;

      if (!this.isFetchedPubs) {
        return this.getUserPubsCacheByPage(pagePattern, pubOrClaim).then((cachePubData: { userPubs: Publication[], pagePattern: string }) => {
          //PARA CARGAR LAS PUBLICACIONES QUE ESTÁN PENDIENTES DE ENVIAR AL BACKEND:
          return this.getOfflinePubsCache(cachePubData.userPubs).then((offUserPubs: Publication[]) => {
            userPubs = (offUserPubs.length > 0) ? userPubs.concat(offUserPubs) : userPubs;
            return { userPubs: userPubs, pagePattern: cachePubData.pagePattern };
          });
          ///
        });
      }
      else {
        this.isFetchedPubs = false;
      }

      return { userPubs: userPubs, pagePattern: webPubData.pagePattern };
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
  private listenToSocket() {
    this.subscriptor = this._socketService.socketPubUpdate$.subscribe((socketPub: any) => {
      if (socketPub) {
        let stream = socketPub.stream;
        let action = socketPub.payload.action.toUpperCase();

        switch (stream) {
          case "publication":
            this.loadUpdatedUserPub({ userPubJson: socketPub.payload.data, action: action });
            break;
        }
      }
    });
  }

  /**
   * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE PUBLICACIONES
   * @param userPubJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
   * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
   */
  public updateUserPubList(userPubJson: any, action: string, userPubList: Publication[]) {
    let lastPub: Publication, newPub: Publication;
    let isDeleted: boolean = false;

    //PREPPENDING THE BACKEND SERVER IP/DOMAIN:
    userPubJson.user_register.profile_path = ((userPubJson.user_register.profile_path.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + userPubJson.user_register.profile_path;
    ////

    //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
    lastPub = userPubList.find(pub => pub.id_publication === userPubJson.id_publication);

    if (action != ArrayManager.DELETE) {
      newPub = this.extractUserPubJson(userPubJson);
    }
    else {
      isDeleted = true;
    }

    verifyStoredData('user-pub', userPubJson, isDeleted);
    this._quejaService.deleteOfflinePub(newPub, userPubList);

    ArrayManager.backendServerSays(action, userPubList, lastPub, newPub);
  }

  /**
   * MÉTODO PARA ELIMINAR UNA PUBLICACIÓN DE LA LISTA DE PUBS:
   * @param pubId 
   */
  public deleteOfflineUserPub(pub: Publication, pubList: Publication[]) {
    pubList.splice(pubList.indexOf(pub), 1);

    deleteItemData("sync-user-eersa-claim", pub.id_publication);
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}
