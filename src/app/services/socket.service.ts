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
  public _paymentResponse = new EventEmitter<any>();

  constructor() { }

  /**
   * MÉTODO PARA CONECTARSE AL SOCKET-SERVER Y ABRIR UNA INSTANCIA CLIENTE
   */
  connectSocket() {
    this.socket = io.connect(REST_SERV.socketServerUrl);

    this.socket.on('backend-rules', (backendData) => {
      console.log("[SOCKET SERVICE] - backend-rules: ", backendData);
      switch (backendData.stream) {
        case "publication":
          this._publicationUpdate.emit(backendData);
          break;
        case "actions":
          if (backendData.payload.data.description) {
            this._commentUpdate.emit(backendData);
          }
          else {
            if (backendData.payload.data.action_parent) {
              this._commentUpdate.emit(backendData);
            }
            else {
              this._publicationUpdate.emit(backendData);
            }
          }
          break;
        case "notification_received":
          this._notificationUpdate.emit(backendData);
          break;
      }
    });

    this.socket.on('response-payment', (paymentData) => {
      console.log("[SOCKET SERVICE] - response-payment: ", paymentData);
      this._paymentResponse.emit(paymentData);
    });
  }

  /**
   * MÉTODO PARA OBTENER LA INSTANCIA DEL OBJETO SOCKET-CLIENT
   */
  getSocket() {
    return this.socket;
  }

  /**
   * MÉTODO PARA RECIBIR EL MENSAJE DE CONFIRMACIÓN DEL PAGO DESDE EL MIDDLEWARE
   */
  public confimPayResp() {
    this.socket.emit('confirm-pay', true);
  }
}
