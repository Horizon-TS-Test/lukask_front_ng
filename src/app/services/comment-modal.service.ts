import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentModalService {
  private modalSubject = new BehaviorSubject<boolean>(null);
  openModal$: Observable<boolean> = this.modalSubject.asObservable();

  constructor() { }

  /**
   * METODO PARA NOTIFICAR QUE EL MODAL DE COMENTARIOS ESTÁ ABIERTO:
   */
  public commentsModalOpened(isOpen: boolean) {
    this.modalSubject.next(isOpen);
  }
}
