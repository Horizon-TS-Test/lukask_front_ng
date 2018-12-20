import { Component, OnInit } from '@angular/core';
import { Nav } from '../../interfaces/nav.interface';
import { Subscription } from 'rxjs';
import { RouterService } from '../../services/router.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { InstallPromptService } from 'src/app/services/install-prompt.service';

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
    private _userService: UserService,
    private _routerService: RouterService,
    private _notificationService: NotificationService,
    private _installPromptService: InstallPromptService
  ) {
    this._enableMainMenu = false;
    this.newEntries = true;
    this.initEntries(true);

    this.menuSubscription = this._routerService.enableMenu$.subscribe(
      (enable: boolean) => {
        this._enableMainMenu = enable && this._userService.isLoggedIn();
        this.forceClickMenu();
      }
    );

    this.newEntrieSubscription = this._notificationService.newNotif$.subscribe((entry) => {
      if (entry) {
        this.entriesNumber = this.entriesNumber + 1;
      }
    });
  }

  ngOnInit() { }

  /**
   * METODO PARA ABRIR LOS PANELES DE OPCIONES Y NAVEGACIÓN
   */
  private forceClickMenu() {
    if (this._enableMainMenu && this._userService.isLoggedIn()) {
      setTimeout(() => {
        let menu: HTMLElement = document.getElementById('menu-nav') as HTMLElement;
        if (menu) {
          if (!menu.classList.contains("menu-is-open")) {
            menu.click();
          }
        }
      }, 1000);
    }
  }

  /**
   * METODO PARA ABRIR EL PANEL PRINCIPAL DE OPCIONES AL DAR CLICK EN EL BOTÓN DE MENÚ:
   * @param event
   */
  public openPanel(event: any) {
    event.preventDefault();

    this._installPromptService.openInstallPrompt();

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
   * METODO PARA INICIALIZAR EN CERO EL NÚMERO DE ENTRADAS. ESTE METODO PUEDE
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
