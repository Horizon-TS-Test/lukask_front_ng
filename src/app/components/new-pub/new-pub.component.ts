import { Component, OnInit, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';

declare var $: any;

@Component({
  selector: 'new-pub',
  templateUrl: './new-pub.component.html',
  styleUrls: ['./new-pub.component.css']
})
export class NewPubComponent implements OnInit, AfterViewInit {
  @Output() closeModal = new EventEmitter<boolean>();

  private customCarousel: any;

  public carouselOptions: any;
  public initStream: boolean;
  public matButtons: HorizonButton[];
  public actionType: number;

  constructor() {
    this.initStream = false;
    this.matButtons = [
      {
        parentContentType: 0,
        action: ACTION_TYPES.submitPub,
        icon: 'check',
        class: 'animated-btn animate-in'
      },
      {
        parentContentType: 0,
        action: ACTION_TYPES.initStream,
        icon: 'f',
        customIcon: true,
        class: 'animated-btn'
      },
      {
        parentContentType: 0,
        action: ACTION_TYPES.close,
        icon: 'close'
      }
    ];
  }

  ngOnInit() {
    this.initCarousel();
  }

  ngAfterViewInit() {
    this.handleCameraStatus();
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

  /**
   * HANDLE CAMERA STATUS ON DRAG THE CAROUSEL:
   */
  handleCameraStatus() {
    this.customCarousel = $('#carousel-edit-q');
    this.customCarousel.on('dragged.owl.carousel', (event) => {
      const streamView = this.customCarousel.find('.owl-item:last-child');
      if (streamView.hasClass('active')) {
        this.initStream = true;
      } else {
        this.initStream = false;
      }
    });
  }

  /**
   * MÉTODO PARA ACCEDER A LA OPCIÓN DE INICIAR STREAMING:
   * @param event 
   * @param cancel PARA SALIR DE LA OPCIÓN DE INICIAR STREAMING
   */
  initStreaming(event: any, cancel: boolean = false) {
    event.preventDefault();
    if (cancel) {
      $('.owl-carousel').trigger('prev.owl.carousel');
      this.initStream = false;
    } else {
      $('.owl-carousel').trigger('next.owl.carousel');
      this.initStream = true;
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.submitPub:
        this.actionType = ACTION_TYPES.submitPub;
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }
}
