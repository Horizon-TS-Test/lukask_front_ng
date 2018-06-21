import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import { QuejaType } from '../../models/queja-type';
import { User } from '../../models/user';
import { DomSanitizer } from '@angular/platform-browser';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ContentService } from '../../services/content.service';
import { SingleMapComponent } from '../single-map/single-map.component';
import { CONTENT_TYPES } from '../../config/content-type';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'queja-detail',
  templateUrl: './queja-detail.component.html',
  styleUrls: ['./queja-detail.component.css']
})
export class QuejaDetailComponent implements OnInit {
  @ViewChild("mapRef", { read: ViewContainerRef }) mapRef: ViewContainerRef;
  @Input() idQueja: string;
  @Output() closeModal: EventEmitter<boolean>;

  private _CLOSE = 1;

  public quejaDetail: Publication;
  public matButtons: HorizonButton[];
  public carouselOptions: any;

  constructor(
    private _quejaService: QuejaService,
    private _cfr: ComponentFactoryResolver,
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    public _domSanitizer: DomSanitizer
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        parentContentType: 1,
        action: this._CLOSE,
        icon: "close"
      }
    ];
    this.carouselOptions = {};
  }

  ngOnInit() {
    this._quejaService.getPubById(this.idQueja)
      .then((pub: Publication) => {
        this.quejaDetail = pub;
        this.initCarousel();
        this.renderMap();
      }).catch(error => console.log(error));
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE FOTOS:
   */
  initCarousel() {
    this.carouselOptions = {
      items: 1, dots: true, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false,
      navText: ['<i class="fa fa-chevron-left " title="Anterior "></i>', '<i class="fa fa-chevron-right" title="Siguiente "></i>'],
    }
  }

  /**
   * MÉTODO PARA INCRUSTAR EL COMPONENTE DE MAPA ASÍNCRONAMENTE:
   */
  renderMap() {
    setTimeout(() => {
      this._contentService.addComponent(SingleMapComponent, this._cfr, this.mapRef, { contentType: CONTENT_TYPES.single_map, contentData: this.quejaDetail });
    }, 1000)
  }

  /**
   * MÉTODO PARA VER UNA IMAGEN EN PRIMER PLANO
   * @param event EVENTO DE CLICK
   */
  viewImg(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_img, contentData: this.quejaDetail.media });
  }

  /**
   * MÉTODO PARA VER EL MODAL DE COMENTARIOS DE UNA PUBLICACIÓN ESPECÍFICA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  viewComments(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_comments, contentData: this.quejaDetail.id_publication });
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

}
