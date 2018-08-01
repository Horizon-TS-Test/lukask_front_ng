import { Injectable, EventEmitter } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  public _enableMainMenu = new EventEmitter<boolean>();

  constructor(
    private _router: Router
  ) { }

  /**
   * MÉTODO PARA ESCUCHAR EL EVENTO DE CAMBIO DE RUTA Y EJECUTAR CIERTA OPERACIÓN:
   */
  public listenRouteChanges() {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        let url = event.url;
        if (url.indexOf("activity") !== -1 || url.indexOf("login") !== -1) {
          this._enableMainMenu.emit(false);
        }
        else {
          this._enableMainMenu.emit(true);
        }
        console.log("Route Change Start!");
      } else if (event instanceof NavigationEnd) {
        console.log("Route Change End!");
      }
    });
  }
}
