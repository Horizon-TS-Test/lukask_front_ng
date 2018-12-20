import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { VAPID_KEY } from '../config/vapid';
import { BrowserNotifierService } from './browser-notifier.service';
import { UserService } from './user.service';
import { BehaviorSubject, Observable } from 'rxjs';

declare var urlBase64ToUint8Array: any;

@Injectable({
  providedIn: 'root'
})
export class SubscribeService {
  private afterSubsSubject = new BehaviorSubject<boolean>(null);
  afterSubs$: Observable<boolean> = this.afterSubsSubject.asObservable();

  constructor(
    private _http: Http,
    private _browserNotifierService: BrowserNotifierService,
    private _userService: UserService
  ) { }

  /**
   * NEXT METHOD IS NOT FUNCTIONAL ON MOBILE DEVICES:
   */
  /*askForSubscription() {
    console.log("from askForSubscription() Subscribe service");
    console.log(VAPID_KEY);
    this._swPush.requestSubscription({
      serverPublicKey: VAPID_KEY
    }).then(newSub => this.callPushSub(newSub))
      .catch(err => console.error("Could not subscribe to notifications", err));
  }*/

  /**
   * METODO PARA PREGUNTAR SI ES QUE EL USUARIO DESEA RECIBIR NOTIFICACIONES PUSH:
   */
  public askForSubscription(letSubscribe: boolean = true) {
    return Notification.requestPermission((result) => {
      if (result !== 'granted') {
        console.log('[LUKASK SUBSCRIBE SERVICE] - Notification persmission not granted')
        return;
      }
      else {
        console.log('[LUKASK SUBSCRIBE SERVICE] - Notification persmission granted')
        return this.configurePushSub(letSubscribe);
      }
    });
  }

  /**
   * METODO PARA PREPARAR LAS CREDENCIALES Y LLAVES PARA SOLICITAR UNA SUBSCRIPCIÓN AL SERVIDOR:
   */
  private configurePushSub(letSubscribe: boolean) {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready
      .then((swreg) => {
        var convertedVapidPubKey = urlBase64ToUint8Array(VAPID_KEY);

        return swreg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPubKey
        });
      })
      /*.then((subscription) => {
        if (subscription == null) {
          //CREATE A NEW SUBSCRIPTION
          console.log("No suscrito");
        }
        else {
          console.log("Suscrito");
          //WE HAVE A SUBSCRIPTION - NOTHING TO DO!
        }
        
      })*/
      .then((newSub) => {//SENDING REQUEST TO OUR SUBS SERVER TO ALSO SEND THE REQUEST AT THE SAME TIME TO FIREBASE
        this.callPushSub(newSub, letSubscribe);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * METODO PARA SOLICITAR UNA SUBSCRIPCIÓN AL SERVIDOR PUSH:
   * @param newSub LOS DATOS DEL ENDPOINT PARA LA SUBSCRIPCIÓN
   */
  private callPushSub(newSub: any, letSubscribe: boolean) {
    const subBody = JSON.stringify({ user_id: this._userService.getUserProfile().id, push_id: newSub });
    const subHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserKey()
    });

    if (letSubscribe) {
      return this._http.post(REST_SERV.pushSub, subBody, { headers: subHeaders, withCredentials: true }).toPromise()
        .then((response) => {
          if (response.ok) {
            this._browserNotifierService.displayConfirmNotification();
            localStorage.setItem('user_subs', 'true');
            console.log("[LUKASK SUBSCRIBE SERVICE] - SUCCESSFULLY SUBSCRIBED");
            this.afterSubsSubject.next(true);
            return true;
          }
        }).catch(function (err) {
          console.log(err);
        });
    }

    this.unsubscribe();

    return this._http.post(REST_SERV.unsubsribe, subBody, { headers: subHeaders, withCredentials: true }).toPromise()
      .then((response) => {
        if (response.ok) {
          localStorage.setItem('user_subs', 'false');
          console.log("[LUKASK SUBSCRIBE SERVICE] - SUCCESSFULLY UNSUBSCRIBED");
          this.afterSubsSubject.next(false);
          return true;
        }
      }).catch(function (err) {
        console.log(err);
      });
  }

  /**
   * METODO PARA DESUSCRIBIR A UN DISPOSITIVO, DE LAS NOTIFICACIONES PUSH
   * REF: https://blog.learningtree.com/utilizing-push-notifications-progressive-web-app-pwa/
   */
  private unsubscribe() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready
      .then((swreg) => {
        swreg.pushManager.getSubscription()
          .then((subscription) => {
            if (subscription) {
              subscription.unsubscribe();
            }
          })
          .catch(function (error) {
            console.log('Error while unsubscribing', error);
          })
      });
  }

  /**
   * METODO PARA VERIFICAR SI EL DISPOSITIVO ESTÁ SUSCRITO A RECIBIR NOTIFICACIONES PUSH:
   */
  public isSubscribed() {
    if (localStorage.getItem('user_subs')) {
      return localStorage.getItem('user_subs') === 'true';
    }

    return false;
  }
}
