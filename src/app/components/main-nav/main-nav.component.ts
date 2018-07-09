import { Component, OnInit } from '@angular/core';
import { Nav } from '../../interfaces/nav.interface';
import { Subscription } from 'rxjs';
import { RouterService } from '../../services/router.service';
import { NotificationService } from '../../services/notification.service';

declare var $: any;

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {
  private menuSubscription: Subscription;
  private newEntrieSubscription: Subscription;

  public mainNav: Nav[];
  public newEntries: boolean;
  public entriesNumber: number;
  public _enableMainMenu: boolean;

  constructor(
    private _routerService: RouterService,
    private _notificationService: NotificationService
  ) {
    this._enableMainMenu = true;
    this.newEntries = true;
    this.initEntries(true);

    this.menuSubscription = this._routerService._enableMainMenu.subscribe(
      (enable: boolean) => {
        this._enableMainMenu = enable;
        if (enable == true) {
          this.forceClickMenu();
        }
      }
    );

    this.newEntrieSubscription = this._notificationService._newNotif.subscribe((entry) => {
      this.entriesNumber = this.entriesNumber + 1;
    });
  }

  ngOnInit() { }

  forceClickMenu() {
    setTimeout(() => {
      let menu: HTMLElement = document.getElementById('menu-nav') as HTMLElement;
      if (menu) {
        if (!menu.classList.contains("menu-is-open")) {
          menu.click();
        }
      }
    }, 1000);
  }

  /**
   * MÉTODO PARA ABRIR EL PANEL PRINCIPAL DE OPCIONES AL DAR CLICK EN EL BOTÓN DE MENÚ:
   * @param event
   */
  public openPanel(event: any) {
    event.preventDefault();

    $('#menu-nav').toggleClass('menu-is-open');
    if (!$(".top-panel").hasClass("slide-in")) {
      this.newEntries = false;
      $(".top-panel").addClass("slide-in");
      $(".bot-panel").addClass("slide-in");
    }
    else {
      this.newEntries = true;
      $(".top-panel").removeClass("slide-in");
      $(".bot-panel").removeClass("slide-in");
    }
  }

  /**
   * MÉTODO PARA INICIALIZAR EN CERO EL NÚMERO DE ENTRADAS. ESTE MÉTODO PUEDE
   * ESCUCHAR EL CAMBIO DE UN EVENT EMITTER DEL HIJO DE ESTE COMPONENTE:
   */
  initEntries(event: boolean) {
    if (event) {
      this.entriesNumber = 0;
    }
  }

  ngOnDestroy() {
    this.menuSubscription.unsubscribe();
    this.newEntrieSubscription.unsubscribe();
  }
}
