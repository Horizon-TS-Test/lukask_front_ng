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
import { HorizonSwitchInputInterface } from '../../interfaces/horizon-switch-in.interface';
import { QuejaService } from 'src/app/services/queja.service';
import { Publication } from 'src/app/models/publications';
import { NavigationPanelService } from 'src/app/services/navigation-panel.service';
import { CONTENT_TYPES } from 'src/app/config/content-type';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { DynamicPubsService } from 'src/app/services/dynamic-pubs.service';
import { UserService } from 'src/app/services/user.service';
import { ScreenService } from 'src/app/services/screen.service';
import { UserPubsService } from 'src/app/services/user-pubs.service';
import { PUB_TYPES } from 'src/app/config/pub-types';

declare var $: any;
declare var device: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('owlElement') owlElement: OwlCarousel;

  private subscriptor: Subscription;
  private adminSubscriber: Subscription;
  private offPubSub: Subscription;
  private pubUpdateSub: Subscription;
  private newPubActionSub: Subscription;
  private pubContainer: any;
  private ownPubsContainer: any;
  private customCarousel: any;
  private paymentSubs: Subscription;
  private screenSubs: Subscription;
  private screenDelay: number;
  private pagePattern: string;
  private pubList: Publication[];

  public enableSecondOp: boolean;
  public enableThirdOp: boolean;
  public carouselOptions: any;
  public focusedPubId: string;
  public touchDrag: boolean;
  public webViewPort: boolean;
  public askforMorePubs: boolean;
  public isAdmin: boolean;
  public isNative: boolean;

  constructor(
    private _domSanitizer: DomSanitizer,
    private _contentService: ContentService,
    private _navigationPanelService: NavigationPanelService,
    private _dynaContentService: DynaContentService,
    private _dynamicPubsService: DynamicPubsService,
    private _socket: SocketService,
    public _quejaService: QuejaService,
    public _userService: UserService,
    private _screenService: ScreenService,
    public _userPubsService: UserPubsService
  ) {
    this.screenDelay = 4000;
    this.listeToScreenDelay();
    this.touchDrag = true;
    this.askforMorePubs = false;
  }

  ngOnInit() {
    this.isNativeApp();

    ////RESPONSIVE INDICATOR:
    this.manageResponsiveViewPort();
    ////
    this._contentService.fadeInComponent($("#homeContainer"));

    this.listenAdminFlag();
    this.listenToMenuChanges();
    this.initCarousel();
    this.listenToOffUserPub();
    this.listenToPubUpdate();
    this.listenToNewPubAction();
    this.paymentSocketUpdate();
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
   * LISTEN TO EVENT EMITTER WITH ADMIN/USER FLAG:
   */
  private listenAdminFlag() {
    this.adminSubscriber = this._userService.isAdmin$.subscribe((resp) => {
      if (resp != null) {
        this.isAdmin = resp;
        this.getPubList();
      }
    });
  }

  /**
   * METODO PARA ESCUCHAR LOS CAMBIOS DE LAS PUBLICACIONES PROPIAS DEL USUARIO QUE SON INSERTADAS DE FORMA OFFLINE
   */
  private listenToOffUserPub() {
    this.offPubSub = this._quejaService.newOffPub$.subscribe((offPub: Publication) => {
      if (offPub) {
        this.pubList.splice(0, 0, offPub);
        this._quejaService.loadPubs(this.pubList);
      }
    });
  }

  /**
   * METODO PARA ESCUCHAR LOS CAMBIOS DE LAS PUBLICACIONES PROPIAS DEL USUARIO QUE VIENEN TRAVES DEL SOCKET.IO CLIENT:
   */
  private listenToPubUpdate() {
    this.pubUpdateSub = this._quejaService.pubUpdate$.subscribe((pubData: { userPubJson: any, action: string }) => {
      if (pubData && this.pubList) {
        if (pubData.userPubJson.type_publication_detail == PUB_TYPES.pub) {
          this._quejaService.updatePubList(pubData.userPubJson, pubData.action, this.pubList);
          this._quejaService.loadPubs(this.pubList);
        }
      }
    });
  }

  /**
   * METODO PARA ESCUCHAR LOS CAMBIOS DE LAS PUBLICACIONES PROPIAS DEL USUARIO QUE VIENEN TRAVES DEL SOCKET.IO CLIENT:
   */
  private listenToNewPubAction() {
    this.newPubActionSub = this._quejaService.newPubAction$.subscribe((pubActinData: any) => {
      if (pubActinData && this.pubList) {
        this._quejaService.updateRelevanceNumber(pubActinData, this.pubList);
        this._quejaService.loadPubs(this.pubList);
      }
    });
  }

  /**
   * METODO PARA CONTROLAR EL VIEWPORT RESPONSIVO:
   */
  private manageResponsiveViewPort() {
    this.webViewPort = $("#reponsive-layout").css("display") == "block";

    $(window).resize(() => {
      this.webViewPort = $("#reponsive-layout").css("display") == "block";
    })
  }

  /**
   * METODO PARA SUBSCRIBIRSE AL EVENTO DE CAMBIO DE MENU DE NAVEGACIÓN:
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
   * METODO PARA MANIPULAR EL EVENTO DE SCROLL DENTRO DEL COMPONENTE PRINCIPAL DE QUEJAS:
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
   * METODO PARA MANIPULAR EL EVENTO DE SCROLL DENTRO DEL COMPONENTE PRINCIPAL DE QUEJAS:
   */
  private onScrollOwnPubContainer() {
    this.ownPubsContainer = $('#user-pub-container');
    this.ownPubsContainer.scroll(() => {
      if (this._contentService.isBottomScroll(this.ownPubsContainer)) {
        this._userPubsService.requestMoreUserPubs();
      }
    });
  }

  /**
   * METODO PARA ESCUCHAR LA RESPUESTA DEL PAGO DE SERVICIOS BÁSICOS:
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
   * METODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  private initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false,
      touchDrag: this.touchDrag, mouseDrag: false
    };
  }

  ngAfterViewInit() {
  }

  /**
   * HANDLE CAMERA STATUS ON DRAG THE CAROUSEL:
   */
  private handleMenuCarousel() {
    this.customCarousel = $('#carousel-home');

    this.customCarousel.on('dragged.owl.carousel', (event) => {
      let menuIndex = event.item.index;
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
        case MENU_OPTIONS.claims:
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
        case MENU_OPTIONS.claims:
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
   * METODO PARA NAVEGAR EN CIERTA OPCIÓN DEL CAROUSEL:
   */
  private changeOwlContent(option: number) {
    if (this.owlElement) {
      this.owlElement.to([option, 300, true]);
      setTimeout(() => {
        this._navigationPanelService.navigateMenu(option);
      }, 400);
    }
  }

  /**
   * METODO PARA RE INICIALIZAR EL ELEMENTO OWL CAROUSEL:
   */
  private reInitCarousel() {
    this.initCarousel();
    this.owlElement.reInit();
  }

  /**
   * METODO PARA CAPTAR LA ACCIÓN DE ALGÚN BOTÓN DEL LA LSITA DE BOTONES, COMPONENTE HIJO
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
   * METODO PARA DETECTAR LOS CAMBIOS DEL SWITCH INPUT COMO COMPONENTE HIJO
   * @param event VALOR BOOLEANO DEL EVENT EMITTER DEL COMPONENTE HIJO
   */
  public getSwitchChanges(event: HorizonSwitchInputInterface) {
    this.touchDrag = event.checked;
    this.reInitCarousel();
  }

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  private getPubList() {
    this._quejaService.getPubList().then((pubData: { userPubs: Publication[], pagePattern: string }) => {
      this.pagePattern = pubData.pagePattern;
      this.pubList = pubData.userPubs;
      this.onScrollPubContainer();
      this.onScrollOwnPubContainer();
      this.handleMenuCarousel();
      setTimeout(() => {
        this._quejaService.loadPubs(this.pubList);
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
      this._quejaService.getMorePubs(this.pagePattern, this.pubList).then((pubData: { userPubs: Publication[], pagePattern: string }) => {
        this.pagePattern = pubData.pagePattern;
        this.pubList = pubData.userPubs;
        this.askforMorePubs = false;
        setTimeout(() => {
          this._quejaService.loadPubs(this.pubList);
        }, 1000);
      });
    }
  }

  /**
   * METODO PARA ESCUCHAR LA LLEGADA DE UNA PUBLICACION ACTUALIZADA CON RELEVANCIA OFFLINE:
   * @param event 
   */
  public onOfflineRelevance(event: Publication) {
    this._quejaService.changePubOffRelevance(event, this.pubList);
    this._quejaService.loadPubs(this.pubList);
  }

  /**
   * METODO PARA CANCELAR EL ENVIO DE UNA PUB OFFLINE:
   * @param $event 
   */
  public cancelPub(pub: Publication) {
    this._quejaService.deleteOfflinePub(pub, this.pubList);
    this._quejaService.loadPubs(this.pubList);
  }

  ngOnDestroy() {
    this._quejaService.loadPubs(null);
    this._socket.loadPayConfirm(null);
    this._dynaContentService.loadDynaContent(null);
    this._dynamicPubsService.askForMorePubs(false);

    this.subscriptor.unsubscribe();
    this.adminSubscriber.unsubscribe();
    this.paymentSubs.unsubscribe();
    this.screenSubs.unsubscribe();
    this.offPubSub.unsubscribe();
    this.pubUpdateSub.unsubscribe();
    this.newPubActionSub.unsubscribe();
  }
}
