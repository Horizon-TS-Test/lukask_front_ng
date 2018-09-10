import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { ContentService } from './services/content.service';
import { NotifierService } from './services/notifier.service';
import { AlertComponent } from './components/alert/alert.component';
import { Subscription } from 'rxjs';
import { SocketService } from './services/socket.service';
import { CONTENT_TYPES } from './config/content-type';
import { Alert } from './models/alert';
import { UserService } from './services/user.service';
import { HorizonNotification } from './models/horizon-notification';
import { NotificationService } from './services/notification.service';
import { RouterService } from './services/router.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
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
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _notificationService: NotificationService,
    private _socketService: SocketService,
    private _routerService: RouterService,
    private _cfr: ComponentFactoryResolver,
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
    this.listenToAlertReq();
    this.listenNotifSocket();
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
  public listenWorkerMessage() {
    this.channel = new BroadcastChannel('lsw-events');

    this.channel.addEventListener('message', (event) => {
      let swData = event.data;
      this.firstInstall = !swData.message;
    });
  }

  /**
   * MÉTODO PARA ESCUCHAR ACERCA DE UNA NUEVA ACTUALIZACIÓN DEL SERVICE WORKER:
   */
  public listenWorkerUpdateMessage() {
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
  triggerUpdate(event: boolean) {
    if (event) {
      this.channel.postMessage({ skipWaiting: true });
      location.href = '/';
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR UN EVENTO DESDE OTRO COMPONENTE PARA MOSTRAR EL MODAL DE INSTALACIÓN
   */
  private listenToInstallReq() {
    this.installSubscriber = this._notifierService._reqInstallation.subscribe(
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
  public triggerInstallPromt() {
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
   * MÉTODO PARA ESCUCHAR EL EVENTO PARA ABRIR EL COMPONENTE DE ALERTA:
   */
  private listenToAlertReq() {
    this.subscription = this._notifierService.listenAlert().subscribe(
      (alertData: Alert) => {
        this._contentService.addComponent(AlertComponent, this._cfr, this.alertContainer, { contentType: CONTENT_TYPES.alert, contentData: alertData });
      }
    );
  }

  /**
   * MÉTODO PARA ESCUCHAR LAS NOTIFICACIONES ENTRANTES:
   */
  private listenNotifSocket() {
    this.socketSubscription = this._socketService._notificationUpdate.subscribe(
      (notifData: any) => {
        if (notifData.payload.data.user_received == this._userService.getUserProfile().id) {
          let newNotif: HorizonNotification = this._notificationService.extractNotifJson(notifData.payload.data);
          this._notificationService.showNotification(newNotif);
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
