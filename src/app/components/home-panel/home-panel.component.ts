import { Component, OnInit } from '@angular/core';
import { SubscribeService } from '../../services/subscribe.service';

@Component({
  selector: 'home-panel',
  templateUrl: './home-panel.component.html',
  styleUrls: ['./home-panel.component.css']
})
export class HomePanelComponent implements OnInit {
  public isAble: boolean;
  public subsStyle: string;

  constructor(
    private _subscribeService: SubscribeService
  ) {
    this.subsStyle = "secondary";
  }

  ngOnInit() {
    this.isAbleToSubscribe();
  }

  /**
   * MÉTODO PARA HABILITAR O DESHABILITAR EL BOTÓN DE ACTIVAR NOTIFICACIONES 
   * PUSH DEPENDIENDO DE SI EL NAVEGADOR SOPORTA O NO ESTA FUNCIONALIDAD:
   */
  isAbleToSubscribe() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      this.isAble = true;
    }
    else {
      this.isAble = false;
    }
  }

  /**
   * MÉTODO PARA PROCESAR LA SUBSCRIPCIÓN AL SERVIDOR DE NOTIFICACIONES PUSH PARA 
   * PODER RECIBIR NOTIFICACIONES ACERCA DE NUEVAS ACTUALIZACIONES EN LA APP:
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   */
  subscribe(event: any) {
    event.preventDefault();
    this.subsStyle = "";
    this._subscribeService.askForSubscription();
  }
}
