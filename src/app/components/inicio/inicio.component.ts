import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { Subscription } from 'rxjs';
import { MENU_OPTIONS } from '../../config/menu-option';
import { ACTION_TYPES } from '../../config/action-types';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Alert } from '../../models/alert';
import { SocketService } from '../../services/socket.service';
import { ALERT_TYPES } from '../../config/alert-types';
import { OwlCarousel } from '../../../../node_modules/ngx-owl-carousel';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('owlElement') owlElement: OwlCarousel;
  private pubContainer: any;
  private customCarousel: any;
  private subscriptor: Subscription;
  private alertData: Alert;

  public enableSecondOp: boolean;
  public enableThirdOp: boolean;
  public carouselOptions: any;
  public focusedPubId: string;
  public touchDrag: boolean;


  constructor(
    private _domSanitizer: DomSanitizer,
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _socket: SocketService
  ) {
    this.touchDrag = true;
  }

  ngOnInit() {
    this.pubContainer = $('#pub-container');
    this._contentService.fadeInComponent($("#homeContainer"));


    this._notifierService.notifyChangeMenuContent(MENU_OPTIONS.home);
    this.subscriptor = this._notifierService._changeMenuOption.subscribe(
      (menuOption: number) => {
        console.log(menuOption);
        this.changeOwlContent(menuOption);
      });

    this.pubContainer.scroll(() => {
      if (this._contentService.isBottomScroll(this.pubContainer)) {
        this._notifierService.notifyMorePubsRequest(true);
      }
    });

    this.initCarousel();
    this.paymentSocketUpdate();
  }

  /**
   * MÉTODO PARA ESCUCHAR LA RESPUESTA DEL PAGO DE SERVICIOS BÁSICOS:
   */
  paymentSocketUpdate() {
    this._socket._paymentResponse.subscribe(
      (socketPago: any) => {
        const data = JSON.parse(socketPago);
        console.log("CORREO DEL USUARIO QUE PAGA EL SERVICO: ", data.data.email);
        if (data) {
          this.alertData = new Alert({ title: "Proceso Correcto", message: "Pago exitoso de servicios básicos de la cuenta de usuario: " + data.data.email, type: ALERT_TYPES.success });
          this.setAlert();
          this._socket.confimPayResp();
        }
      });
  }

  /**
   * MÉTODO PARA MOSTRAR UN MENSAJE DE ALERTA EN EL DOM
   */
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false,
      touchDrag: this.touchDrag, mouseDrag: false
    };
  }

  ngAfterViewInit() {
    this.handleMenuCarousel();
  }

  /**
   * HANDLE CAMERA STATUS ON DRAG THE CAROUSEL:
   */
  handleMenuCarousel() {
    this.customCarousel = $('#carousel-home');

    this.customCarousel.on('dragged.owl.carousel', (event) => {
      const menuIndex = event.item.index;
      switch (menuIndex) {
        case MENU_OPTIONS.home:
          break;
        case MENU_OPTIONS.mapview:
          this.enableSecondOp = true;
          this.touchDrag = false;
          this.reInitCarousel();
          break;
        case MENU_OPTIONS.payment:
          this.enableThirdOp = true;
          break;
      }
      this._notifierService.notifyChangeMenuContent(menuIndex);
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
            this.touchDrag = false;
            this.reInitCarousel();
          }
          break;
        case MENU_OPTIONS.payment:
          this.enableThirdOp = true;
          if (!this.touchDrag) {
            this.touchDrag = true;
            this.reInitCarousel();
          }
          break;
      }
      setTimeout(() => {
        this._notifierService.notifyChangeMenuContent(menuIndex);
      }, 800);
      console.log("CAROUSEL 'TO' EVENT: ", menuIndex);
    });
  }

  /**
   * MÉTODO PARA NAVEGAR EN CIERTA OPCIÓN DEL CAROUSEL:
   */
  changeOwlContent(option: number) {
    this.owlElement.to([option, 300, true]);
  }

  /**
   * MÉTODO PARA RE INICIALIZAR EL ELEMENTO OWL CAROUSEL:
   */
  reInitCarousel() {
    this.initCarousel();
    this.owlElement.reInit();
  }

  /**
   * MÉTODO PARA CAPTAR LA ACCIÓN DE ALGÚN BOTÓN DEL LA LSITA DE BOTONES, COMPONENTE HIJO
   * @param $event VALOR DEL TIPO DE ACCIÓN QUE VIENE EN UN EVENT-EMITTER
   */
  optionButtonAction(event: DynaContent) {
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
  getSwitchChanges(event: boolean) {
    this.touchDrag = event;
    this.reInitCarousel();
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}
