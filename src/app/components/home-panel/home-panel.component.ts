import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SubscribeService } from '../../services/subscribe.service';
import { HorizonSwitchInputInterface } from '../../interfaces/horizon-switch-in.interface';

@Component({
  selector: 'home-panel',
  templateUrl: './home-panel.component.html',
  styleUrls: ['./home-panel.component.css']
})
export class HomePanelComponent implements OnInit, OnChanges {
  @Input() checkedInput: boolean;
  @Output() switchChange: EventEmitter<HorizonSwitchInputInterface>;

  public isAble: boolean;
  public subsStyle: string;
  public switchInput: HorizonSwitchInputInterface;

  constructor(
    private _subscribeService: SubscribeService
  ) {
    this.subsStyle = "secondary";
    this.switchChange = new EventEmitter<HorizonSwitchInputInterface>();
  }

  ngOnInit() {
    this.initSwitchInput();
    this.isAbleToSubscribe();
  }

  /**
   * MÉTODO PARA INICIALIZAR UN HORIZON-SWITCH-INPUT:
   */
  initSwitchInput() {
    this.switchInput = {
      id: 'home-check',
      label: '',
      checked: this.checkedInput
    }

    console.log(this.switchInput);
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
  getSwitchChanges(event: HorizonSwitchInputInterface) {
    this.switchChange.emit(event);
  }

  /**
   * MÉTODO PARA RECARGAR LA APLICACIÓN
   */
  public reloadApp(event: any) {
    event.preventDefault();
    location.href = '/';
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      switch (property) {
        case 'checkedInput':
          if (changes[property].currentValue !== undefined) {
            this.checkedInput = changes[property].currentValue;
            this.initSwitchInput();
          }
          break;
      }
    }
  }
}
