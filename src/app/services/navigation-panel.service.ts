import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationPanelService {
  private menuSubject = new BehaviorSubject<number>(-1);
  private contentSubject = new BehaviorSubject<number>(-1);
  
  navigateMenu$: Observable<number> = this.menuSubject.asObservable();
  navigateContent$: Observable<number> = this.contentSubject.asObservable();

  constructor() { }

  /**
   * MÉTODO PARA NAVEGAR EN OTRA OPCIÓN DEL PANEL PRINCIPAL DE NAVEGACIÓN:
   * @param option 
   */
  public navigateMenu(option: number) {
    this.menuSubject.next(option);
  }

  public navigateContent(option: number) {
    this.contentSubject.next(option);
  }
}
