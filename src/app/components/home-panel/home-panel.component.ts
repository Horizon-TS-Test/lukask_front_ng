import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { SubscribeService } from '../../services/subscribe.service';
import { HorizonSwitchInputInterface } from '../../interfaces/horizon-switch-in.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'home-panel',
  templateUrl: './home-panel.component.html',
  styleUrls: ['./home-panel.component.css']
})
export class HomePanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() checkedInput: boolean;
  @Output() switchChange: EventEmitter<HorizonSwitchInputInterface>;

  public subscriptor: Subscription;

  public isAble: boolean;
  public subsStyle: string;
  public switchInput: HorizonSwitchInputInterface;

  constructor(
    private _subscribeService: SubscribeService,
  ) {
    this.switchChange = new EventEmitter<HorizonSwitchInputInterface>();
  }

  ngOnInit() {
    this.initSwitchInput();
    this.isAbleToSubscribe();
    this.defineSubsBtnStyle();
    this.listenAfterSubscribe();
  }

  /**
   * METODO PARA DEFINIR EL ESTILO DEL BOTÓN DE SUBSCRIPCIÓN:
   */
  private defineSubsBtnStyle() {
    this.subsStyle = this._subscribeService.isSubscribed() ? "" : "secondary";
  }

  /**
   * METODO PARA INICIALIZAR UN HORIZON-SWITCH-INPUT:
   */
  private initSwitchInput() {
    this.switchInput = {
      id: 'home-check',
      label: '',
      checked: this.checkedInput,
      customClass: 'switch-light'
    }
  }

  /**
   * METODO PARA HABILITAR O DESHABILITAR EL BOTÓN DE ACTIVAR NOTIFICACIONES 
   * PUSH DEPENDIENDO DE SI EL NAVEGADOR SOPORTA O NO ESTA FUNCIONALIDAD:
   */
  private isAbleToSubscribe() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      this.isAble = true;
    }
    else {
      this.isAble = false;
    }
  }

  /**
   * METODO PARA ESCUCHAR SI EL DISPOSITIVO ESTÁ O NO SUSCRITO, PARA LUEGO CAMBIAR EL ESTILO:
   */
  private listenAfterSubscribe() {
    this.subscriptor = this._subscribeService.afterSubs$.subscribe((subscribed: boolean) => {
      this.subsStyle = subscribed ? "" : "secondary";
    });
  }

  /**
   * METODO PARA PROCESAR LA SUBSCRIPCIÓN AL SERVIDOR DE NOTIFICACIONES PUSH PARA 
   * PODER RECIBIR NOTIFICACIONES ACERCA DE NUEVAS ACTUALIZACIONES EN LA APP:
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   */
  public subscribe(event: any) {
    event.preventDefault();
    let subscribe = !this._subscribeService.isSubscribed();
    this._subscribeService.askForSubscription(subscribe);
  }

  /**
   * METODO PARA DETECTAR LOS CAMBIOS DEL SWITCH INPUT COMO COMPONENTE HIJO
   * @param event VALOR BOOLEANO DEL EVENT EMITTER DEL COMPONENTE HIJO
   */
  public getSwitchChanges(event: HorizonSwitchInputInterface) {
    setTimeout(() => {
      this.switchChange.emit(event);
    }, 200);
  }

  /**
   * METODO PARA RECARGAR LA APLICACIÓN
   */
  public reloadApp(event: any) {
    event.preventDefault();
    location.href = '/';
  }

  /**
   * METODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
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

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}