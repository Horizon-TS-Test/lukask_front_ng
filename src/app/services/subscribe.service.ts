import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { UrlManager } from '../tools/url-manager';
import { REST_SERV } from '../rest-url/rest-servers';
import { VAPID_KEY } from '../config/vapid';
import { SwPush } from '@angular/service-worker';
import { BrowserNotifierService } from './browser-notifier.service';

@Injectable({
  providedIn: 'root'
})
export class SubscribeService {

  constructor(
    private _swPush: SwPush,
    private _http: Http,
    private _browserNotifierService: BrowserNotifierService
  ) { }

  askForSubscription() {
    this._swPush.requestSubscription({
      serverPublicKey: VAPID_KEY
    }).then(newSub => this.callPushSub(newSub))
      .catch(err => console.error("Could not subscribe to notifications", err));
  }

  callPushSub(newSub: any) {
    const subBody = JSON.stringify(newSub);
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
