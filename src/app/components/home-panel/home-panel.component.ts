import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SubscribeService } from '../../services/subscribe.service';

@Component({
  selector: 'home-panel',
  templateUrl: './home-panel.component.html',
  styleUrls: ['./home-panel.component.css']
})
export class HomePanelComponent implements OnInit {
  @Input() checkedInput: boolean;
  @Output() switchChange: EventEmitter<boolean>;

  public isAble: boolean;
  public subsStyle: string;

  constructor(
    private _subscribeService: SubscribeService
  ) {
    this.subsStyle = "secondary";
    this.switchChange = new EventEmitter<boolean>();
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

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DEL SWITCH INPUT COMO COMPONENTE HIJO
   * @param event VALOR BOOLEANO DEL EVENT EMITTER DEL COMPONENTE HIJO
   */
  getSwitchChanges(event: boolean) {
    this.switchChange.emit(event);
  }

  /**
   * MÉTODO PARA RECARGAR LA APLICACIÓN
   */
  public reloadApp(event: any) {
    event.preventDefault();
    location.href = '/';
  }
}
