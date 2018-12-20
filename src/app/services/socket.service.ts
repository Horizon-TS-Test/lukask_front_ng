import { Injectable } from '@angular/core';

///////// SOCKET.IO-CLIENT FROM EXPRESS SERVER /////////
import * as io from "socket.io-client";
////////////////////////////////////////////////////////

import { REST_SERV } from './../rest-url/rest-servers';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;

  private socketPubUpdateSubject = new BehaviorSubject<any>(null);
  socketPubUpdate$: Observable<any> = this.socketPubUpdateSubject.asObservable();

  private commUpdateSubject = new BehaviorSubject<any>(null);
  commUpdate$: Observable<any> = this.commUpdateSubject.asObservable();

  private notifUpdateSubject = new BehaviorSubject<any>(null);
  notifUpdate$: Observable<any> = this.notifUpdateSubject.asObservable();

  private payUpdateSubject = new BehaviorSubject<any>(null);
  payUpdate$: Observable<any> = this.payUpdateSubject.asObservable();

  constructor() { }

  /**
   * METODO PARA CONECTARSE AL SOCKET-SERVER Y ABRIR UNA INSTANCIA CLIENTE
   */
  public connectSocket() {
    this.socket = io.connect(REST_SERV.socketServerUrl);

    this.socket.on('backend-rules', (backendData) => {
      console.log("[SOCKET SERVICE] - backend-rules: ", backendData);
      switch (backendData.stream) {
        case "publication":
          this.socketPubUpdateSubject.next(backendData);
          break;
        case "actions":
          if (backendData.payload.data.description) {
            this.commUpdateSubject.next(backendData);
          }
          else {
            if (backendData.payload.data.action_parent) {
              this.commUpdateSubject.next(backendData);
            }
            else {
              this.socketPubUpdateSubject.next(backendData);
            }
          }
          break;
        case "notification_received":
          this.notifUpdateSubject.next(backendData);
          break;
      }
    });

    this.socket.on('response-payment', (paymentData) => {
      console.log("[SOCKET SERVICE] - response-payment: ", paymentData);
      this.loadPayConfirm(paymentData);
    });
  }

  /**
   * METODO PARA OBTENER LA INSTANCIA DEL OBJETO SOCKET-CLIENT
   */
  getSocket() {
    return this.socket;
  }

  /**
   * METODO PARA RECIBIR EL MENSAJE DE CONFIRMACIÓN DEL PAGO DESDE EL MIDDLEWARE
   */
  public confimPayResp() {
    this.socket.emit('confirm-pay', true);
  }

  /**
   * METODO PARA CARGAR LOS DATOS DE LA CONFIRMACIÓN DEL PAGO:
   * @param paymentData 
   */
  public loadPayConfirm(paymentData: any) {
    this.payUpdateSubject.next(paymentData);
  }
}
