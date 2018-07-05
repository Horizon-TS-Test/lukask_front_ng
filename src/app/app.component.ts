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

  private subscription: Subscription;
  private socketSubscription: Subscription;

  public _enableMainMenu: boolean;

  constructor(
    private _userService: UserService,
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _notificationService: NotificationService,
    private _socketService: SocketService,
    private _routerService: RouterService,
    private _cfr: ComponentFactoryResolver
  ) {
    this._routerService.listenRouteChanges();

    this.checkLogin();
    if (this._enableMainMenu) {
      this._socketService.connectSocket();
      this._userService.getRestUserProfile();
    }

    this.subscription = this._notifierService.listenAlert().subscribe(
      (alertData: Alert) => {
        this._contentService.addComponent(AlertComponent, this._cfr, this.alertContainer, { contentType: CONTENT_TYPES.alert, contentData: alertData });
      }
    );

    this.listenNotifSocket();
  }

  /**
   * MÉTODO PARA VERIFICAR SI UN USUARIO ESTÁ LOGEADO Y MOSTRAR EL MENÚ PRINCIPAL:
   */
  checkLogin() {
    //this.isLoggedIn = true;
    this._enableMainMenu = this._userService.isLoggedIn();
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
    this.socketSubscription.unsubscribe();
  }
}
