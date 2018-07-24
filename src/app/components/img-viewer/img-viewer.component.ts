import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Media } from '../../models/media';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

@Component({
  selector: 'img-viewer',
  templateUrl: './img-viewer.component.html',
  styleUrls: ['./img-viewer.component.css']
})
export class ImgViewerComponent implements OnInit {
  @Input() media: Media;

  public _dynaContent: DynaContent;
  public carouselOptions: any;
  public materialBtn: HorizonButton[];

  constructor() { }

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
}
