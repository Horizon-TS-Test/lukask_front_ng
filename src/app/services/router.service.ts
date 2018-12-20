import { Injectable } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  private enableMenuSub = new BehaviorSubject<boolean>(null);
  enableMenu$: Observable<boolean> = this.enableMenuSub.asObservable();

  constructor(
    private _router: Router
  ) { }

  /**
   * METODO PARA ESCUCHAR EL EVENTO DE CAMBIO DE RUTA Y EJECUTAR CIERTA OPERACIÓN:
   */
  public listenRouteChanges() {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        let url = event.url;
        if (url.indexOf("activity") !== -1 || url.indexOf("login") !== -1 || url.indexOf("streaming") !== -1) {
          this.enableMenuSub.next(false);
        }
        else {
          this.enableMenuSub.next(true);
        }
        console.log("[ROUTER SERIVCE]: Route Change Start!");
      } else if (event instanceof NavigationEnd) {
        console.log("[ROUTER SERIVCE]: Route Change End");
      }
    });
  }
}
