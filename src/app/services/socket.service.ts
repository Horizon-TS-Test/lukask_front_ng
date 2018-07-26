import { Injectable, EventEmitter } from '@angular/core';

///////// SOCKET.IO-CLIENT FROM EXPRESS SERVER /////////
import * as io from "socket.io-client";
////////////////////////////////////////////////////////

import { REST_SERV } from './../rest-url/rest-servers';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;
  public _publicationUpdate = new EventEmitter<any>();
  public _commentUpdate = new EventEmitter<any>();
  public _notificationUpdate = new EventEmitter<any>();
  public _responsepayment = new EventEmitter<any>();

  constructor() { }

  connectSocket() {
    this.socket = io.connect(REST_SERV.socketServerUrl);

    this.socket.on('backend-rules', (backendData) => {
      console.log("backend-rules: ", backendData);
      switch (backendData.stream) {
        case "publication":
          this._publicationUpdate.emit(backendData);
          break;
        case "multimedia":
          this._publicationUpdate.emit(backendData);
          break;
        case "comments":
          this._commentUpdate.emit(backendData);
          break;
        case "notification_received":
          console.log("NOtificación!!!");
          this._notificationUpdate.emit(backendData);
          break;
      }
    });

    this.socket.on('response-payment', (paymentData) => {
      console.log("response-payment: ", paymentData);
      this._responsepayment.emit(paymentData);
    });
  }

  getSocket() {
    return this.socket;
  }
}
