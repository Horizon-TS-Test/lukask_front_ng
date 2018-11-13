import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraActionService {
  private actionSubject = new BehaviorSubject<number>(-1);
  cameraAction$: Observable<number> = this.actionSubject.asObservable();

  constructor() { }

  /**
   * MÉTODO PARA NOTIFICAR EL CAMBIO DE ACCIÓN A REALIZAR CON LA CÁMERA:
   */
  public sendCameraAction(action: number) {
    this.actionSubject.next(action);
  }
}
