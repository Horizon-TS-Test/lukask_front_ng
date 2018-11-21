import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { Subscription } from 'rxjs';
import { MENU_OPTIONS } from '../../config/menu-option';
import { ACTION_TYPES } from '../../config/action-types';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Alert } from '../../models/alert';
import { SocketService } from '../../services/socket.service';
import { ALERT_TYPES } from '../../config/alert-types';
import { OwlCarousel } from '../../../../node_modules/ngx-owl-carousel';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { QuejaService } from 'src/app/services/queja.service';
import { Publication } from 'src/app/models/publications';
import { NavigationPanelService } from 'src/app/services/navigation-panel.service';
import { CONTENT_TYPES } from 'src/app/config/content-type';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { DynamicPubsService } from 'src/app/services/dynamic-pubs.service';
import { ScreenService } from 'src/app/services/screen.service';

declare var $: any;
declare var device: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('owlElement') owlElement: OwlCarousel;

  private screenSubs: Subscription;
  private pubContainer: any;
  private customCarousel: any;
  private subscriptor: Subscription;
  private paymentSubs: Subscription;
  private screenDelay: number;

  public enableSecondOp: boolean;
  public enableThirdOp: boolean;
  public carouselOptions: any;
  public focusedPubId: string;
  public touchDrag: boolean;
  public webViewPort: boolean;
  public askforMorePubs: boolean;
  public isNative: boolean;

  constructor(
    private _domSanitizer: DomSanitizer,
    private _contentService: ContentService,
    private _navigationPanelService: NavigationPanelService,
    private _dynaContentService: DynaContentService,
    private _dynamicPubsService: DynamicPubsService,
    private _socket: SocketService,
    public _quejaService: QuejaService,
    private _screenService: ScreenService
  ) {
    this.touchDrag = true;
    this.askforMorePubs = false;
    this.screenDelay = 4000;
    this.listeToScreenDelay();
  }

  ngOnInit() {
    this.isNativeApp();

    ////RESPONSIVE INDICATOR:
    this.manageResponsiveViewPort();
    ////
    this._contentService.fadeInComponent($("#homeContainer"));

    this._navigationPanelService.navigateMenu(MENU_OPTIONS.home);
    this.listenToMenuChanges();

    this.initCarousel();
    this.paymentSocketUpdate();

    this.getPubList();
  }

  /**
   * METODO PARA ESCUCHAR LA DEFINICION DEL TIEMPO DE RETARDO DE LA INTERFAZ ANTES DE CARGAR SU CONTENIDO
   */
  private listeToScreenDelay() {
    this.screenSubs = this._screenService.screenDelay$.subscribe((delay: number) => {
      if (delay) {
        this.screenDelay = delay;
      }
    });
  }

  /**
   * METODO PARA DETECTAR SI EL APP ESTA DESPLEGADA EN FORMA DE APP MOVIL NATIVA:
   */
  private isNativeApp() {
    document.addEventListener("deviceready", () => {
      this.isNative = device.platform ? true : false;
    }, false);
  }

  /**
   * MÉTODO PARA CONTROLAR EL VIEWPORT RESPONSIVO:
   */
  private manageResponsiveViewPort() {
    this.webViewPort = $("#reponsive-layout").css("display") == "block";

    $(window).resize(() => {
      this.webViewPort = $("#reponsive-layout").css("display") == "block";
    })
  }

  /**
   * MÉTODO PARA SUBSCRIBIRSE AL EVENTO DE CAMBIO DE MENU DE NAVEGACIÓN:
   */
  private listenToMenuChanges() {
    this.subscriptor = this._navigationPanelService.navigateContent$.subscribe(
      (menuOption: number) => {
        if (menuOption != -1) {
          this.changeOwlContent(menuOption);
        }
      });
  }

  /**
   * MÉTODO PARA MANIPULAR EL EVENTO DE SCROLL DENTRO DEL COMPONENTE PRINCIPAL DE QUEJAS:
   */
  private onScrollPubContainer() {
    this.pubContainer = $('#pub-container');
    this.pubContainer.scroll(() => {
      if (this._contentService.isBottomScroll(this.pubContainer)) {
        this.getMorePubs();
        this._dynamicPubsService.askForMorePubs();
      }
    });
  }

  /**
   * MÉTODO PARA ESCUCHAR LA RESPUESTA DEL PAGO DE SERVICIOS BÁSICOS:
   */
  private paymentSocketUpdate() {
    this.paymentSubs = this._socket.payUpdate$.subscribe((socketPago: any) => {
      if (socketPago) {
        const data = JSON.parse(socketPago);
        console.log("CORREO DEL USUARIO QUE PAGA EL SERVICO: ", data.data.email);
        if (data) {
          let alertData = new Alert({ title: "Proceso Correcto", message: "Pago exitoso de servicios básicos de la cuenta de usuario: " + data.data.email, type: ALERT_TYPES.success });
          this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.alert, contentData: alertData });

          this._socket.confimPayResp();
        }
      }
    });
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  private initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false,
      touchDrag: this.touchDrag, mouseDrag: false
    };
  }

  ngAfterViewInit() {
    this.handleMenuCarousel();
    this.onScrollPubContainer();
  }

  /**
   * HANDLE CAMERA STATUS ON DRAG THE CAROUSEL:
   */
  private handleMenuCarousel() {
    this.customCarousel = $('#carousel-home');

    this.customCarousel.on('dragged.owl.carousel', (event) => {
      const menuIndex = event.item.index;
      switch (menuIndex) {
        case MENU_OPTIONS.home:
          break;
        case MENU_OPTIONS.mapview:
          this.enableSecondOp = true;
          setTimeout(() => {
            this.touchDrag = false;
            this.reInitCarousel();
          }, 250);
          break;
        case MENU_OPTIONS.payment:
          this.enableThirdOp = true;
          break;
      }
      this._navigationPanelService.navigateMenu(menuIndex);
      console.log("CAROUSEL DRAGGED EVENT: ", event.item.index);
    });

    this.customCarousel.on('to.owl.carousel', (event, menuIndex) => {
      switch (menuIndex) {
        case MENU_OPTIONS.home:
          if (!this.touchDrag) {
            this.touchDrag = true;
            this.reInitCarousel();
          }
          break;
        case MENU_OPTIONS.mapview:
          this.enableSecondOp = true;
          if (this.touchDrag) {
            setTimeout(() => {
              this.touchDrag = false;
              this.reInitCarousel();
            }, 300);
          }
          break;
        case MENU_OPTIONS.payment:
          this.enableThirdOp = true;
          if (!this.touchDrag) {
            setTimeout(() => {
              this.touchDrag = true;
              this.reInitCarousel();
            }, 300);
          }
          break;
      }
      setTimeout(() => {
        //this._navigationPanelService.navigate(menuIndex);
      }, 800);
      console.log("CAROUSEL 'TO' EVENT: ", menuIndex);
    });
  }

  /**
   * MÉTODO PARA NAVEGAR EN CIERTA OPCIÓN DEL CAROUSEL:
   */
  private changeOwlContent(option: number) {
    this.owlElement.to([option, 300, true]);
    setTimeout(() => {
      this._navigationPanelService.navigateMenu(option);
    }, 400);
  }

  /**
   * MÉTODO PARA RE INICIALIZAR EL ELEMENTO OWL CAROUSEL:
   */
  private reInitCarousel() {
    this.initCarousel();
    this.owlElement.reInit();
  }

  /**
   * MÉTODO PARA CAPTAR LA ACCIÓN DE ALGÚN BOTÓN DEL LA LSITA DE BOTONES, COMPONENTE HIJO
   * @param $event VALOR DEL TIPO DE ACCIÓN QUE VIENE EN UN EVENT-EMITTER
   */
  public optionButtonAction(event: DynaContent) {
    if (event.contentType === ACTION_TYPES.mapFocus) {
      this.focusedPubId = null;
      setTimeout(() => {
        this.focusedPubId = event.contentData;
      });
      this.changeOwlContent(MENU_OPTIONS.mapview);
    }
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DEL SWITCH INPUT COMO COMPONENTE HIJO
   * @param event VALOR BOOLEANO DEL EVENT EMITTER DEL COMPONENTE HIJO
   */
  public getSwitchChanges(event: boolean) {
    this.touchDrag = event;
    this.reInitCarousel();
  }

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  private getPubList() {
    this._quejaService.getPubList().then((pubs: Publication[]) => {
      setTimeout(() => {
        this._quejaService.loadPubs(pubs);
      }, this.screenDelay);
    }).catch(err => {
      console.log(err);
    });
  }

  /**
   * FUNCIÓN PARA OBTENER PUBLICACIONES BAJO DEMANDA A TRAVÉS DE UN PATTERN DE PAGINACIÓN:
   */
  private getMorePubs() {
    if (!this.askforMorePubs) {
      this.askforMorePubs = true;
      this._quejaService.getMorePubs().then((morePubs: Publication[]) => {
        this.askforMorePubs = false;
        setTimeout(() => {
          this._quejaService.loadPubs(morePubs);
        }, 1000);
      });
    }
  }

  ngOnDestroy() {
    this._quejaService.loadPubs(null);
    this._socket.loadPayConfirm(null);
    this._dynaContentService.loadDynaContent(null);
    this._dynamicPubsService.askForMorePubs(false);

    this.subscriptor.unsubscribe();
    this.paymentSubs.unsubscribe();
    this.screenSubs.unsubscribe();
  }
}
