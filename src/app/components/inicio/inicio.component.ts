import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { Subscription } from 'rxjs';
import { MENU_OPTIONS } from '../../config/menu-option';
import { ACTION_TYPES } from '../../config/action-types';
import { DynaContent } from '../../interfaces/dyna-content.interface';

declare var $: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit, OnDestroy {
  private pubContainer: any;
  private customCarousel: any;
  private subscriptor: Subscription;

  public enableSecondOp: boolean;
  public enableThirdOp: boolean;
  public carouselOptions: any;
  public focusedPubId: string;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService
  ) { }

  ngOnInit() {
    this.pubContainer = $('#pub-container');
    this._contentService.fadeInComponent($("#homeContainer"));
    
    this._notifierService.notifyChangeMenuContent(MENU_OPTIONS.home);
    this.subscriptor = this._notifierService._changeMenuOption.subscribe(
      (menuOption: number) => {
        this.changeOwlContent(menuOption);
      });

    this.pubContainer.scroll(() => {
      if (this._contentService.isBottomScroll(this.pubContainer)) {
        this._notifierService.notifyMorePubsRequest(true);
      }
    });

    this.initCarousel();
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false
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
          break;
        case MENU_OPTIONS.payment:
          break;
      }
      this._notifierService.notifyChangeMenuContent(menuIndex);
      console.log("CAROUSEL DRAGGED EVENT: ", event.item.index);
    });

    this.customCarousel.on('to.owl.carousel', (event, menuIndex) => {
      switch (menuIndex) {
        case MENU_OPTIONS.home:
          break;
        case MENU_OPTIONS.mapview:
          this.enableSecondOp = true;
          break;
        case MENU_OPTIONS.payment:
          break;
      }
      this._notifierService.notifyChangeMenuContent(menuIndex);
      console.log("CAROUSEL 'TO' EVENT: ", menuIndex);
    });
  }

  /**
   * MÉTODO PARA NAVEGAR EN CIERTA OPCIÓN DEL CAROUSEL:
   */
  changeOwlContent(option: number) {
    $('#carousel-home').find('.owl-carousel').trigger('to.owl.carousel', [option, 300, true]);
  }

  /**
   * MÉTODO PARA CAPTAR LA ACCIÓN DE ALGÚN BOTÓN DEL LA LSITA DE BOTONES, COMPONENTE HIJO
   * @param $event VALOR DEL TIPO DE ACCIÓN QUE VIENE EN UN EVENT-EMITTER
   */
  optionButtonAction(event: DynaContent) {
    if(event.contentType === ACTION_TYPES.mapFocus) {
      this.focusedPubId = event.contentData;
      this.changeOwlContent(MENU_OPTIONS.mapview);
    }
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}
