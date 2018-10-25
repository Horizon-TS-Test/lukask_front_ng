import { Component, ViewChild, ViewContainerRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from './services/socket.service';
import { UserService } from './services/user.service';
import { HorizonNotification } from './models/horizon-notification';
import { NotificationService } from './services/notification.service';
import { RouterService } from './services/router.service';
import { InstallPromptService } from './services/install-prompt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('alert_parent', { read: ViewContainerRef }) alertContainer: ViewContainerRef;

  private deferredPrompt: any;
  private channel: any;
  private updateChannel: any;
  private subscription: Subscription;
  private installSubscriber: Subscription;
  private socketSubscription: Subscription;

  public firstInstall: boolean;
  public askForUpdates: boolean;

  constructor(
    private _userService: UserService,
    private _notificationService: NotificationService,
    private _installPromptService: InstallPromptService,
    private _socketService: SocketService,
    private _routerService: RouterService,
  ) {
    this.askForUpdates = false;

    this.preventInstallPrompt();
    this.afterSwInstall();

    this._routerService.listenRouteChanges();

    if (this.checkLogin()) {
      this._socketService.connectSocket();
      this._userService.getRestUserProfile();
    }

    this.listenWorkerMessage();
    this.listenWorkerUpdateMessage();
    this.listenToInstallReq();
    this.listenNotifSocket();
  }

  ngOnInit() {
  }
  /**
   * MÉTODO PARA EVITAR QUE EL NAVEGADOR DESPLIEGUE POR SI MISMO EL BANNER DE INSTALACIÓN DEL APP
   */
  private preventInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
  }

  /**
   * MÉTODO PARA ADECUAR LA INTERFAZ DE USUARIO PARA MOSTRAR EL PROCESO DE INSTALACIÓN DEL SERVICE WORKER:
   */
  private afterSwInstall() {
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker['__zone_symbol__controllerchangefalse']) {
        if (!navigator.serviceWorker.controller) {
          this.firstInstall = true;
        }
        else {
          this.firstInstall = false;
        }
      }
      else {
        this.firstInstall = false;
      }
    }
    else {
      this.firstInstall = false;
    }
  }

  /**
   * MÉTODO PARA VERIFICAR SI UN USUARIO ESTÁ LOGEADO Y MOSTRAR EL MENÚ PRINCIPAL:
   */
  private checkLogin() {
    return this._userService.isLoggedIn();
  }

  /**
   * MÉTODO PARA ESCUCHAR LOS EVENTOS DEL SERVICE WORKER:
   */
  private listenWorkerMessage() {
    this.channel = new BroadcastChannel('lsw-events');

    this.channel.addEventListener('message', (event) => {
      /*let swData = event.data;
      this.firstInstall = !swData.message;*/
      if (event) {
        location.href = '';
      }
    });
  }

  /**
   * MÉTODO PARA ESCUCHAR ACERCA DE UNA NUEVA ACTUALIZACIÓN DEL SERVICE WORKER:
   */
  private listenWorkerUpdateMessage() {
    this.updateChannel = new BroadcastChannel('lets-update');

    this.updateChannel.addEventListener('message', (event) => {
      let swData = event.data;
      if (swData.askForUpdate === true) {
        this.askForUpdates = swData.askForUpdate;
      }
    });
  }

  /**
   * MÉTODO PARA ESCUCHAR EL EVENTO DE CLICK DEL PROMPT DE ACTUALIZACIÓN DEL APP
   * @param $event 
   */
  public triggerUpdate(event: boolean) {
    if (event) {
      this.channel.postMessage({ skipWaiting: true });
      location.href = '/';
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR UN EVENTO DESDE OTRO COMPONENTE PARA MOSTRAR EL MODAL DE INSTALACIÓN
   */
  private listenToInstallReq() {
    this.installSubscriber = this._installPromptService.installPrompt$.subscribe(
      (installIt: boolean) => {
        if (installIt) {
          this.triggerInstallPromt();
        }
      }
    );
  }

  /**
   * MÉTODO PARA DESENCADENAR EL DIÁLOGO PARA INSTALAR EL APP:
   */
  private triggerInstallPromt() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice
        .then((choiceResult) => {
          console.log(choiceResult.outcome);
          if (choiceResult.outcome === 'accepted') {
            console.log('[APP COMPONENT] - User accepted the prompt');
          } else {
            console.log('[APP COMPONENT] - User dismissed the prompt');
          }
          this.deferredPrompt = null;
        });
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS NOTIFICACIONES ENTRANTES:
   */
  private listenNotifSocket() {
    this.socketSubscription = this._socketService._notificationUpdate.subscribe(
      (notifData: any) => {
        if (notifData.payload.data.user_received == this._userService.getUserProfile().id) {
          let newNotif: HorizonNotification = this._notificationService.extractNotifJson(notifData.payload.data);
          this._notificationService.showNotification(newNotif, this._userService.onStreaming);
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.installSubscriber.unsubscribe();
    this.socketSubscription.unsubscribe();
  }
}