import { Injectable, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Alert } from './../models/alert';
import { DynaContent } from '../interfaces/dyna-content.interface';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class NotifierService {

  private _alertListener = new Subject<any>();
  private _layerListener = new Subject<DynaContent>();
  public _cameraAction = new EventEmitter<number>();
  public _morePubsRequest = new EventEmitter<boolean>();
  public _newCommentResp = new EventEmitter<Comment>();
  public _closeModal = new EventEmitter<boolean>();

  constructor() { }

  listenAlert(): Observable<any> {
    return this._alertListener.asObservable();
  }

  sendAlert(alert: Alert) {
    this._alertListener.next(alert);
  }

  listenLayer(): Observable<DynaContent> {
    return this._layerListener.asObservable();
  }

  notifyNewContent(contentType: DynaContent) {
    this._layerListener.next(contentType);
  }

  //CAMERA ACTIONS LISTENER:
  notifyCameraAction(action: number) {
    this._cameraAction.emit(action);
  }
  ////

  notifyMorePubsRequest(request: boolean) {
    this._morePubsRequest.emit(request);
  }

  notifyNewCommentResp(newComment: Comment) {
    this._newCommentResp.emit(newComment);
  }

  notifyCloseModal() {
    this._closeModal.emit(true);
  }

}
