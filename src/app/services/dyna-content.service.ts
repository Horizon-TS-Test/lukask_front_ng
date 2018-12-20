import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynaContent } from '../interfaces/dyna-content.interface';

@Injectable({
  providedIn: 'root'
})
export class DynaContentService {
  private dynaSubject = new BehaviorSubject<DynaContent>(null);
  private removeSubject = new BehaviorSubject<boolean>(false);
  private actionOnContent = new BehaviorSubject<DynaContent>(null);

  modalData$: Observable<DynaContent> = this.dynaSubject.asObservable();
  removeDynaCont$: Observable<boolean> = this.removeSubject.asObservable();
  actionInContent$: Observable<DynaContent> = this.actionOnContent.asObservable();

  constructor() { }

  /**
   * METODO PARA MODIFICAR EL VALOR DEL DATO QUE EL OBSERVABLE ESTÁ ESCUCHANDO, PARA POSTERIOR A ELLO
   * NOTIFICAR A LOS QUE ESTAN SUSCRITOS AL OBSERVABLE
   * @param modalData DATO A NOTIFICAR DESPUÉS DE HABERLO RECIBIDO
   */
  public loadDynaContent(dynaCont: DynaContent) {
    this.dynaSubject.next(dynaCont);
  }

  /**
   * METODO PARA MODIFICAR EL VALOR DEL DATO QUE EL OBSERVABLE ESTÁ ESCUCHANDO, PARA POSTERIOR A ELLO
   * NOTIFICAR A LOS QUE ESTAN SUSCRITOS AL OBSERVABLE.
   * METODO UTILIZADO PARA HACER BROADCAST A TODOS LOS COMPONENTES MODALES QUE ESTÉN ESCUCHANDO.
   * @param modalData DATO A NOTIFICAR DESPUÉS DE HABERLO RECIBIDO
   */
  public removeDynaContent(removeIt: boolean) {
    this.removeSubject.next(removeIt);
  }
  
  /**
   * Metodo para notificar que se ejecuten acciones en componenete agreagado
   * dinamicamente
   * @param dynaActionCont {datos de la accion a ejecutar}
   */
  public executeAccion(dynaActionCont: DynaContent){
    this.actionOnContent.next(dynaActionCont);
  }
}
