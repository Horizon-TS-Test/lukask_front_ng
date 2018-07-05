import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { VAPID_KEY } from '../config/vapid';
import { BrowserNotifierService } from './browser-notifier.service';
import { UserService } from './user.service';

declare var urlBase64ToUint8Array: any;

@Injectable({
  providedIn: 'root'
})
export class SubscribeService {

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
   * MÉTODO PARA PREGUNTAR SI ES QUE EL USUARIO DESEA RECIBIR NOTIFICACIONES PUSH:
   */
  public askForSubscription() {
    Notification.requestPermission((result) => {
      console.log("User choise", result);
      if (result !== 'granted') {
        console.log('No notification persmission granted')
      }
      else {
        this.configurePushSub();
      }
    });
  }

  /**
   * MÉTODO PARA PREPARAR LAS CREDENCIALES Y LLAVES PARA SOLICITAR UNA SUBSCRIPCIÓN AL SERVIDOR:
   */
  private configurePushSub() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    var reg;
    navigator.serviceWorker.ready
      .then((swreg) => {
        reg = swreg;
        swreg.pushManager.getSubscription();
      })
      .then((subscription) => {
        if (subscription == null) {
          //CREATE A NEW SUBSCRIPTION
          var convertedVapidPubKey = urlBase64ToUint8Array(VAPID_KEY);

          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPubKey
          });
        }
        else {
          //WE HAVE A SUBSCRIPTION - NOTHING TO DO!
        }
      })
      .then((newSub) => {//SENDING REQUEST TO OUR SUBS SERVER TO ALSO SEND THE REQUEST AT THE SAME TIME TO FIREBASE
        console.log(newSub);
        return this.callPushSub(newSub);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * MÉTODO PARA SOLICITAR UNA SUBSCRIPCIÓN AL SERVIDOR PUSH:
   * @param newSub LOS DATOS DEL ENDPOINT PARA LA SUBSCRIPCIÓN
   */
  private callPushSub(newSub: any) {
    const subBody = JSON.stringify({ user_id: this._userService.getUserProfile().id, push_id: newSub });
    const subHeaders = new Headers({ 'Content-Type': 'application/json' });

    return this._http.post(REST_SERV.pushSub, subBody, { headers: subHeaders }).toPromise()
      .then((response) => {
        if (response.ok) {
          console.log("Successfully subscribed");
          this._browserNotifierService.displayConfirmNotification();
        }
      }).catch(function (err) {
        console.log(err);
      });
  }
}
