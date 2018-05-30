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
      }
    });
  }

  getSocket() {
    return this.socket;
  }
}
