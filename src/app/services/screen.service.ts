import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  private screenDelaySub = new BehaviorSubject<number>(null);
  screenDelay$: Observable<number> = this.screenDelaySub.asObservable();

  constructor() { }

  /**
   * METODO PARA DEFINIR EL TIEMPO QUE SE DEMORARA LA INTERFAZ INICIAL EN CARGAR SU CONTENIDO:
   * @param miliseconds TIEMPO EN MILISEGUNDOS
   */
  public defineScreenDelay(miliseconds: number) {
    this.screenDelaySub.next(miliseconds);
  }
}
