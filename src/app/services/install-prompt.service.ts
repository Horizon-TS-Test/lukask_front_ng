import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstallPromptService {
  private installSubject = new BehaviorSubject<boolean>(false);
  installPrompt$: Observable<boolean> = this.installSubject.asObservable();

  constructor() { }

  /**
   * MÉTODO PARA ENVIAR LA SEÑAL DE APERTURA DEL PROMPT DE INSTALACIÓN DEL APP
   */
  public openInstallPrompt() {
    this.installSubject.next(true);
  }
}
