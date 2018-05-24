import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  public _snapShot = new EventEmitter<any>();

  constructor() { }

  //SEND SNAPSHOT LISTENER:
  notifySnapShot(snapshot: any) {
    this._snapShot.emit(snapshot);
  }
}
