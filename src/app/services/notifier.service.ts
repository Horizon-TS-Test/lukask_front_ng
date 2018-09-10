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
  public _changeMenuOption = new EventEmitter<number>();
  public _changeMenuContent = new EventEmitter<number>();
  public _showHorizonMaterialBtn: EventEmitter<boolean>;
  public _reqInstallation = new EventEmitter<boolean>();

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

  notifyChangeMenuOption(option: number) {
    this._changeMenuOption.emit(option);
  }

  notifyChangeMenuContent(option: number) {
    this._changeMenuContent.emit(option);
  }

  /**
   * USED IN MEDIA STREAMING COMPONENT AND HORIZON MODAL OF COMMENTS:
   */
  /**
   * MÉTODO PARA INICIALIZAR EL EVENT EMITTER PARA MOSTRAR U OCULTAR BOTONES PRINCIPALES DE UN MODAL HORIZON:
   */
  public initShowBtnEmitter() {
    this._showHorizonMaterialBtn = new EventEmitter<boolean>();
  }

  /**
   * MÉTODO PARA ANULAR EL EVENT EMITTER PARA MOSTRAR U OCULTAR BOTONES PRINCIPALES DE UN MODAL HORIZON:
   */
  public closeShowBtnEmitter() {
    this._showHorizonMaterialBtn = null;
  }

  /**
   * MÉTODO PARA NOTIFICAR AL COMPONENTE MEDIA STREAMING DESDE COMMENT LIST PARA OCULTAR UN BOTÓN:
   */
  public notifyShowHorizonBtn(show: boolean = true) {
    this._showHorizonMaterialBtn.emit(show);
  }
  /*********************************************************************************************************/
  
  /**
   * MÉTODO PARA NOTIFICAR AL COMPONENTE PRINCIPAL QUE ACTIVE EL MODAL DE INSTALACIÓN DEL APP:
   */
  public requestInstallation() {
    this._reqInstallation.emit(true);
  }
  /*********************************************************************************************************/
}
