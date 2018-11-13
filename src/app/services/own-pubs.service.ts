import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OwnPubsService {

  private ownPubsReqSubject = new BehaviorSubject<boolean>(false);
  moreOwnPubsRequest$: Observable<boolean> = this.ownPubsReqSubject.asObservable();

  constructor() { }

  /**
   * METODO PARA CARGAR MAS PUBLICACIONES PROPIAS DEL USUARIO:
   */
  public requestMoreOwnPubs() {
    this.ownPubsReqSubject.next(true);
  }
}
