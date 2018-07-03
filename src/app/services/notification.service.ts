import { Injectable, EventEmitter } from '@angular/core';
import { HorizonNotification } from '../models/horizon-notification';
import { UserService } from './user.service';
import { NotifierService } from './notifier.service';
import { CONTENT_TYPES } from '../config/content-type';
import { Http, Headers, Response } from '@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private DEFAULT_LIMIT: number = 5;

  public _newNotif = new EventEmitter<HorizonNotification>();
  public pageLimit: number;

  constructor(
    private _notifierService: NotifierService,
    private _userService: UserService,
    private _http: Http
  ) {
    this.pageLimit = this.DEFAULT_LIMIT;
  }

  /**
   * MÉTODO PARA MOSTRAR NOTIFICACIÓN EN EL DOM:
   */
  public showNotification(notif: HorizonNotification) {
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.new_notification, contentData: notif });
    this._newNotif.emit(notif);
  }

  /**
   * MÉTODO PARA EXTRAER LOS DATOS DE NOTIFICIÓN DE UN OBJETO JSON:
   * @param notifJson
   */
  public extractNotifJson(notifJson) {
    let user = this._userService.extractUserJson(notifJson.user_emit);
    let notif = new HorizonNotification(notifJson.description_notif_rec, notifJson.date_register, notifJson.url, user);

    return notif;
  }

  /**
   * MÉTODO PARA OBTENER NOTIFICACIONES DE UN USUARIO LOGGEADO:
   * @param pagePattern PATTERN DE PAGINACIÓN
   * @param moreComments PETICIÓN BAJO DEMANDA
   */
  public getUserNotifications(pagePattern: string = null, moreNotifs: boolean = false) {
    const requestHeaders = new Headers({
      "Content-Type": "application/json",
      'X-Access-Token': this._userService.getUserKey()
    });
    let flag = true;

    if (moreNotifs && !pagePattern) {
      flag = false;
    }

    if (flag) {
      let filter = "?receiver=" + this._userService.getUserProfile().id + ((pagePattern) ? pagePattern : "&limit=" + this.pageLimit);

      return this._http.get(REST_SERV.notifUrl + filter, {
        headers: requestHeaders,
        withCredentials: true
      }).toPromise()
        .then((response: Response) => {
          const respJson = response.json();
          if (response.status == 200) {
            let jsonNotifs = respJson.notifs.results;
            let notifs: HorizonNotification[] = [];
            for (let notif of jsonNotifs) {
              notifs.push(this.extractNotifJson(notif));
            }

            console.log("[LUKASK QUEJA SERVICE] - NOTIFICATION OF LOGGED IN USER FROM WEB", notifs);
            return { notifs: notifs, pagePattern: respJson.notifs.next };
          }
        })
        .catch((error: Response) => {
          if (error.json().code == 401) {
            localStorage.clear();
          }
          return throwError(error.json());
        });
    }

    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }

}
