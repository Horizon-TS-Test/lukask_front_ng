import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Media } from '../../models/media';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';

@Component({
  selector: 'img-viewer',
  templateUrl: './img-viewer.component.html',
  styleUrls: ['./img-viewer.component.css']
})
export class ImgViewerComponent implements OnInit {
  @Input() media: Media;
  @Input() showClass: string;
  @Output() closeModal: EventEmitter<boolean>;

  public _dynaContent: DynaContent;
  public carouselOptions: any;
  public materialBtn: HorizonButton[];

  constructor() {
    this.closeModal = new EventEmitter<boolean>();
    this.materialBtn = [
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    this.initCarousel();
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE FOTOS:
   */
  initCarousel() {
    this.carouselOptions = {
      items: 1, dots: true, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false,
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }
}
