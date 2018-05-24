import { Injectable, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Alert } from './../models/alert';

@Injectable({
  providedIn: 'root'
})
export class NotifierService {

  private _alertListener = new Subject<any>();
  private _layerListener = new Subject<any>();
  public _cameraAction = new EventEmitter<number>();

  constructor() { }

  listenAlert(): Observable<any> {
    return this._alertListener.asObservable();
  }

  sendAlert(alert: Alert) {
    this._alertListener.next(alert);
  }

  listenLayer(): Observable<any> {
    return this._layerListener.asObservable();
  }

  notifyNewContent(contentType: number) {
    this._layerListener.next(contentType);
  }

  //CAMERA ACTIONS LISTENER:
  notifyCameraAction(action: number) {
    this._cameraAction.emit(action);
  }

}
