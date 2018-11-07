import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { ASSETS } from 'src/app/config/assets-url';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {
  @Output() askForMore = new EventEmitter<boolean>();

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  public firstPattern: string;
  public pagePattern: string;
  public activeClass: string;
  public preloader: string;

  constructor(
    public _notificationService: NotificationService
  ) {
    this.preloader = ASSETS.preloader;
    this.listenNotif();
  }

  ngOnInit() { }

  /**
   * MÉTODO PARA OBTENER LAS RESPUESTAS DE UN COMENTARIO SEA DE LA WEB O DE LA CACHÉ:
   */
  private listenNotif() {
    this._notificationService.notifList$.subscribe((notifData) => {
      if (notifData) {
        let loader = document.querySelector('.bottom-loader');
        let classList = (loader) ? loader.classList : null;
        if (!this.firstPattern) {
          this.firstPattern = notifData.pagePattern;
        }
        this.pagePattern = notifData.pagePattern;

        setTimeout(() => {
          this.activeClass = "";
          classList.remove(this.LOADER_ON);

          setTimeout(() => {
            this.activeClass = this.LOADER_HIDE;
            classList.add(this.LOADER_HIDE);
          }, 800);
        }, 1000);
      }
    });
  }

  /**
   * MÉTODO PARA CARGAR MAS RESPUESTAS
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public requestForMore(event: any) {
    if (event) {
      event.preventDefault();
    }

    //REF: https://www.developeracademy.io/blog/add-remove-css-classes-using-javascript/
    let classList = document.querySelector('.bottom-loader').classList;
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      classList.remove(this.LOADER_HIDE);
      classList.add(this.LOADER_ON);

      if (this.pagePattern) {
        setTimeout(() => {
          this.askForMore.emit(true);
        }, 500);
      }
      else {
        setTimeout(() => {
          this.askForMore.emit(false);
        }, 500);
      }
    }
  }
}
