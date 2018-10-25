import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentFormService {
  private newComSubject = new BehaviorSubject<Comment>(null);
  newComment$: Observable<Comment> = this.newComSubject.asObservable();

  constructor() { }

  /**
   * MÉTODO PARA DEFINIR Y PROPAGAR EL CAMBIO DE VALOR DE UN NUEVO COMENTARIO REGISTRADO:
   */
  public newCommentInserted(com: Comment) {
    this.newComSubject.next(com);
  }
}
