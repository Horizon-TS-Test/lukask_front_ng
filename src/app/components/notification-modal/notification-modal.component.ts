import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { Subscription } from 'rxjs';
import { HorizonNotification } from 'src/app/models/horizon-notification';

@Component({
  selector: 'notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.css']
})
export class NotificationModalComponent implements OnInit, OnDestroy {
  private notificationList: HorizonNotification[];
  private subscription: Subscription;

  public firstPattern: string;
  public pagePattern: string;

  constructor(
    private _notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.getNotifications();
    this.listenNewNotif();
  }

  /**
   * METODO PARA OBTENER LAS RESPUESTAS DE UN COMENTARIO SEA DE LA WEB O DE LA CACHÉ:
   */
  private getNotifications() {
    this._notificationService.getUserNotifications()
      .then((notifData: any) => {
        this.firstPattern = notifData.pagePattern;
        this.pagePattern = notifData.pagePattern;
        this.notificationList = notifData.notifs;
        this._notificationService.loadNotifications(notifData);
      });
  }

  /**
   * METODO PARA ESCUCHAR LA LLEGADA DE NUEVAS NOTIFICACIONES:
   */
  private listenNewNotif() {
    this.subscription = this._notificationService.newNotif$.subscribe((newNotif: HorizonNotification) => {
      if (newNotif && this.notificationList) {
        this.updatePattern();
        this.notificationList.splice(0, 0, newNotif);
        this._notificationService.loadNotifications({ notifs: this.notificationList, pagePattern: this.pagePattern });
      }
    });
  }

  /**
   * METODO PARA CARGAR MAS COMENTARIOS
   * @param event VALOR DEL EVENT EMITTER
   */
  public askForMore(event: boolean) {
    if (event) {
      this._notificationService.getUserNotifications(this.pagePattern, true)
        .then((notifData: any) => {
          this.pagePattern = notifData.pagePattern;
          this.notificationList = this.notificationList.concat(notifData.notifs);

          this._notificationService.loadNotifications({ notifs: this.notificationList, pagePattern: this.pagePattern });
        });
    }
    else {
      this.pagePattern = this.firstPattern;
      this.notificationList.splice(this._notificationService.pageLimit, this.notificationList.length - this._notificationService.pageLimit);
      this._notificationService.loadNotifications({ notifs: this.notificationList, pagePattern: this.pagePattern });
    }
  }

  /**
   * METODO PARA ACTUALIZAR EL PATTERN QUE VIENE DEL BACKEND PARA NO COMPROMETER LA SECUENCIA 
   * DE REGISTRO A TRAER DEL BACKEND BAJO DEMANDA, CUANDO SE REGISTRE UNA NUEVA RESPUESTA:
   */
  private updatePattern() {
    if (this.pagePattern) {
      let offsetPos = this.pagePattern.indexOf("=", this.pagePattern.indexOf("offset")) + 1;
      let newOffset = parseInt(this.pagePattern.substring(offsetPos)) + 1;
      this.pagePattern = this.pagePattern.substring(0, offsetPos) + newOffset;
    }
  }

  ngOnDestroy() {
    this._notificationService.loadNotifications(null);
    this.subscription.unsubscribe();
  }
}
