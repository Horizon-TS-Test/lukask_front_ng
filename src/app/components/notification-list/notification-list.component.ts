import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HorizonNotification } from '../../models/horizon-notification';
import { User } from '../../models/user';
import { Person } from '../../models/person';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit, OnDestroy {
  @Output() closeModal = new EventEmitter<boolean>();
  
  private _CLOSE = 1;
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";
  private subscription: Subscription;

  public firstPattern: string;
  public pagePattern: string;
  public activeClass: string;

  public notificationList: HorizonNotification[];
  public matButtons: HorizonButton[];

  constructor(
    private _notificationService: NotificationService
  ) {
    this.activeClass = this.LOADER_HIDE;
    this.getNotifs();

    this.matButtons = [
      {
        parentContentType: 0,
        action: this._CLOSE,
        icon: "close"
      }
    ];

    this.subscription = this._notificationService._newNotif.subscribe((newNotif: HorizonNotification) => {
      this.notificationList.splice(0, 0, newNotif);
    });
  }

  ngOnInit() { }

  /**
   * MÉTODO PARA OBTENER LAS RESPUESTAS DE UN COMENTARIO SEA DE LA WEB O DE LA CACHÉ:
   */
  getNotifs() {
    this._notificationService.getUserNotifications()
      .then((notifData: any) => {
        this.notificationList = notifData.notifs;
        this.firstPattern = notifData.pagePattern;
        this.pagePattern = notifData.pagePattern;
      });
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL PATTERN QUE VIENE DEL BACKEND PARA NO COMPROMETER LA SECUENCIA 
   * DE REGISTRO A TRAER DEL BACKEND BAJO DEMANDA, CUANDO SE REGISTRE UNA NUEVA RESPUESTA:
   */
  updatePattern() {
    if (this.pagePattern) {
      let offsetPos = this.pagePattern.indexOf("=", this.pagePattern.indexOf("offset")) + 1;
      let newOffset = parseInt(this.pagePattern.substring(offsetPos)) + 1;
      this.pagePattern = this.pagePattern.substring(0, offsetPos) + newOffset;
    }
  }

  /**
   * MÉTODO PARA CARGAR MAS COMENTARIOS
   * @param event EVENTO DEL ELEMENTO <a href="#">
   */
  askForMore(event: any) {
    event.preventDefault();
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      if (this.pagePattern) {
        this._notificationService.getUserNotifications(this.pagePattern, true)
          .then((notifData: any) => {
            setTimeout(() => {
              this.activeClass = "";

              setTimeout(() => {
                this.activeClass = this.LOADER_HIDE;
                this.notificationList = this.notificationList.concat(notifData.notifs);
                this.pagePattern = notifData.pagePattern;
              }, 800);

            }, 1000)
          })
          .catch(err => {
            console.log(err);

            setTimeout(() => {
              this.activeClass = "";

              setTimeout(() => {
                this.activeClass = this.LOADER_HIDE;
              }, 800);
            }, 1000)
          });
      }
      else {
        setTimeout(() => {
          this.activeClass = "";

          setTimeout(() => {
            this.pagePattern = this.firstPattern;
            this.activeClass = this.LOADER_HIDE;
            this.notificationList.splice(this._notificationService.pageLimit, this.notificationList.length - this._notificationService.pageLimit);
          }, 800);
        }, 1000)
      }
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
