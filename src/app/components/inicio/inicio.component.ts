import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { Subscription } from 'rxjs';
import { MENU_OPTIONS } from '../../config/menu-option';

declare var $: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit {
  private self: any;
  private customCarousel: any;
  private subscriptor: Subscription;

  public carouselOptions: any;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService
  ) { }

  ngOnInit() {
    this.self = $('#local-content-1');
    this._contentService.fadeInComponent();
    this.focusInnerOption();

    this.subscriptor = this._notifierService._changeMenuOption.subscribe(
      (menuOption: number) => {
        switch (menuOption) {
          case MENU_OPTIONS.home:
            break;
          case MENU_OPTIONS.mapview:
            this.changeOwlContent();
            break;
          case MENU_OPTIONS.payment:
            break;
        }
      });

    this.self.scroll(() => {
      if (this._contentService.isBottomScroll(this.self)) {
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
    this.handleCameraStatus();
  }

  /**
   * MÉTODO PARA DAR FOCUS A LA OPCIÓN ASOCIADA A ESTE CONTENIDO PRINCIPAL DE NAVEGACIÓN:
   */
  focusInnerOption() {
    this._contentService.focusMenuOption($('#id-top-panel'), 'top-option-0');
  }

  /**
   * HANDLE CAMERA STATUS ON DRAG THE CAROUSEL:
   */
  handleCameraStatus() {
    this.customCarousel = $('#carousel-home');
    this.customCarousel.on('dragged.owl.carousel', (event) => {
      /*if (streamView.hasClass('active')) {
        this.initStream = true;
      } else {
        this.initStream = false;
      }*/
    });
  }

  /**
   * MÉTODO PARA ACCEDER A LA OPCIÓN DE INICIAR STREAMING:
   */
  changeOwlContent() {
    $('.owl-carousel').trigger('to.owl.carousel', [1, 300, true]);
  }
}
