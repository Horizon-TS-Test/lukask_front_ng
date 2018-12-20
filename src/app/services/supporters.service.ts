import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class SupportersService {
  private supportSubject = new BehaviorSubject<{ supporters: User[]; pagePattern: string }>(null);
  supportList$: Observable<{ supporters: User[]; pagePattern: string }> = this.supportSubject.asObservable();

  constructor() { }

  /**
   * METODO PARA ENVIAR LA ACTUALIZACIÓN DE LA LISTA DE USUARIOS QUE HAN APOYADO LA PUBLICACIÓN
   */
  public loadSuppList(suppList: { supporters: User[]; pagePattern: string }) {
    this.supportSubject.next(suppList);
  }
}
