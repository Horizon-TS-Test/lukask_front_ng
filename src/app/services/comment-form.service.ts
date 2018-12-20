import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentFormService {
  private newComSubject = new BehaviorSubject<Comment>(null);
  newComment$: Observable<Comment> = this.newComSubject.asObservable();
  
  private delOffComSubject = new BehaviorSubject<string>(null);
  delOffCommentId$: Observable<string> = this.delOffComSubject.asObservable();
  
  constructor() { }

  /**
   * METODO PARA DEFINIR Y PROPAGAR EL CAMBIO DE VALOR DE UN NUEVO COMENTARIO REGISTRADO:
   */
  public newCommentInserted(com: Comment) {
    this.newComSubject.next(com);
  }

  /**
   * METODO PARA ELIMINAR UN COMENTARIO GUARDADO DE FORMA OFFLINE:
   * @param offCom 
   */
  public deleteOffComent(offComId: string) {
    this.delOffComSubject.next(offComId);
  }
}
