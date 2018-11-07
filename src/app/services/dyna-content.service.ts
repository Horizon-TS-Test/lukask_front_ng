import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynaContent } from '../interfaces/dyna-content.interface';

@Injectable({
  providedIn: 'root'
})
export class DynaContentService {
  private dynaSubject = new BehaviorSubject<DynaContent>(null);
  private removeSubject = new BehaviorSubject<boolean>(false);

  modalData$: Observable<DynaContent> = this.dynaSubject.asObservable();
  removeDynaCont$: Observable<boolean> = this.removeSubject.asObservable();

  constructor() { }

  /**
   * MÉTODO PARA MODIFICAR EL VALOR DEL DATO QUE EL OBSERVABLE ESTÁ ESCUCHANDO, PARA POSTERIOR A ELLO
   * NOTIFICAR A LOS QUE ESTAN SUSCRITOS AL OBSERVABLE
   * @param modalData DATO A NOTIFICAR DESPUÉS DE HABERLO RECIBIDO
   */
  public loadDynaContent(dynaCont: DynaContent) {
    this.dynaSubject.next(dynaCont);
  }

  /**
   * MÉTODO PARA MODIFICAR EL VALOR DEL DATO QUE EL OBSERVABLE ESTÁ ESCUCHANDO, PARA POSTERIOR A ELLO
   * NOTIFICAR A LOS QUE ESTAN SUSCRITOS AL OBSERVABLE.
   * MÉTODO UTILIZADO PARA HACER BROADCAST A TODOS LOS COMPONENTES MODALES QUE ESTÉN ESCUCHANDO.
   * @param modalData DATO A NOTIFICAR DESPUÉS DE HABERLO RECIBIDO
   */
  public removeDynaContent(removeIt: boolean) {
    this.removeSubject.next(removeIt);
  }
}
