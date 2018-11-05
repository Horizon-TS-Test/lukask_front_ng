import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentFormService {
  private newComSubject = new BehaviorSubject<Comment>(null);
  newComment$: Observable<Comment> = this.newComSubject.asObservable();
  
  private delOffComSubject = new BehaviorSubject<Comment>(null);
  delOffComment$: Observable<Comment> = this.delOffComSubject.asObservable();
  
  constructor() { }

  /**
   * MÉTODO PARA DEFINIR Y PROPAGAR EL CAMBIO DE VALOR DE UN NUEVO COMENTARIO REGISTRADO:
   */
  public newCommentInserted(com: Comment) {
    this.newComSubject.next(com);
  }

  /**
   * MÉTODO PARA ELIMINAR UN COMENTARIO GUARDADO DE FORMA OFFLINE:
   * @param offCom 
   */
  public deleteOffComent(offCom: Comment) {
    this.delOffComSubject.next(offCom);
  }
}
