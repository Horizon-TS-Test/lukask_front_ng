import { Component, OnInit, Input } from '@angular/core';
import { HorizonNotification } from '../../models/horizon-notification';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { DynaContentService } from 'src/app/services/dyna-content.service';

declare var $: any;

@Component({
  selector: 'horizon-notification',
  templateUrl: './horizon-notification.component.html',
  styleUrls: ['./horizon-notification.component.css']
})
export class HorizonNotificationComponent implements OnInit {
  @Input() inputNotification: HorizonNotification;

  private _ref: any;
  private _self: any;

  public _dynaContent: DynaContent;
  public notification: HorizonNotification

  constructor(
    public _domSanitizer: DomSanitizer,
    public _notificationService: NotificationService,
    public _DynaContentService: DynaContentService,
    public _router: Router
  ) { }

  ngOnInit() {
    this._self = $(".p-notification").last();
    this.notification = (this._dynaContent) ? <HorizonNotification>this._dynaContent.contentData : this.inputNotification;
  }

  ngAfterViewInit() {
    if (this._dynaContent) {
      setTimeout(() => {
        this.showHideNotif();
      }, 250);

      setTimeout(() => {
        this.showHideNotif(false);
      }, 6500);
    }
  }

  /**
   * METODO PARA ELIMINAR EL COMPONENTE AÑADIDO DINÁMICAMENTE:
   */
  removeObject() {
    this._ref.destroy();
  }

  /**
   * METODO PARA MOSTRAR U OCULTAR CON ANIMACIÓN EL COMPONENTE:
   * @param show
   */
  showHideNotif(show: boolean = true) {
    if (show) {
      this._self.parent().addClass("active");
      this._self.addClass("on");
    }
    else {
      this._self.removeClass("on");
      this._self.parent().removeClass("active");

      setTimeout(() => {
        this.removeObject();
      }, 500);
    }
  }

  /**
   * METODO PARA ABRIR EL RECURSO QUE LLEGA JUNTO CON LA NOTIFICACIÓN:
   */
  public openUrl(event: any) {
    event.preventDefault();
    this._DynaContentService.removeDynaContent(true);
    if (this._ref) {
      this.showHideNotif(false);
    }
    //REF:https://github.com/angular/angular/issues/18798#soulfresh
    this._router.navigateByUrl(this.notification.url);
  }
}
