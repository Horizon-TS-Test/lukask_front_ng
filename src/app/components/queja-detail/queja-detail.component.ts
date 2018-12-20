import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ContentService } from '../../services/content.service';
import { SingleMapComponent } from '../single-map/single-map.component';
import { CONTENT_TYPES } from '../../config/content-type';
import { ACTION_TYPES } from '../../config/action-types';
import { Subscription } from '../../../../node_modules/rxjs';
import { DynaContentService } from 'src/app/services/dyna-content.service';

@Component({
  selector: 'queja-detail',
  templateUrl: './queja-detail.component.html',
  styleUrls: ['./queja-detail.component.css']
})
export class QuejaDetailComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild("mapRef", { read: ViewContainerRef }) mapRef: ViewContainerRef;
  @Input() showClass: string;
  @Input() idQueja: string;
  @Input() commentId: string;
  @Input() replyId: string;
  @Input() isModal: boolean;
  @Output() closeModal: EventEmitter<boolean>;

  private subscriptor: Subscription;

  public quejaDetail: Publication;
  public matButtons: HorizonButton[];
  public carouselOptions: any;
  public isUnavaliable: boolean;

  constructor(
    private _quejaService: QuejaService,
    private _cfr: ComponentFactoryResolver,
    private _contentService: ContentService,
    private _dynaContentService: DynaContentService,
    public _domSanitizer: DomSanitizer
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        action: ACTION_TYPES.close,
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
        if (this.commentId) {
          if (this.quejaDetail) {
            setTimeout(() => {
              this.viewComments();
            }, 100);
          }
          else {
            this.isUnavaliable = true;
          }
        }

        if (this.isModal == true) {
          this.renderMap();
        }
      }).catch(error => console.log(error));

    this.subscriptor = this._quejaService.pubDetail$.subscribe((newPub: Publication) => {
      this.quejaDetail = newPub;
    });
  }

  /**
   * METODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE FOTOS:
   */
  initCarousel() {
    this.carouselOptions = {
      items: 1, dots: true, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false,
      navText: ['<i class="fa fa-chevron-left " title="Anterior "></i>', '<i class="fa fa-chevron-right" title="Siguiente "></i>'],
    }
  }

  /**
   * METODO PARA INCRUSTAR EL COMPONENTE DE MAPA ASÍNCRONAMENTE:
   */
  renderMap() {
    setTimeout(() => {
      this._contentService.addComponent(SingleMapComponent, this._cfr, this.mapRef, { contentType: CONTENT_TYPES.single_map, contentData: this.quejaDetail });
    }, 1000);
  }

  /**
   * METODO PARA VER UNA IMAGEN EN PRIMER PLANO
   * @param event EVENTO DE CLICK
   */
  public viewImg(event: any) {
    event.preventDefault();
    this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.view_img, contentData: {media :this.quejaDetail.media, opView: CONTENT_TYPES.view_img} });
	  //this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_img, contentData: { media :this.quejaDetail.media, opView: CONTENT_TYPES.view_img}});
  }

  /**
   * METODO PARA VER EL MODAL DE COMENTARIOS DE UNA PUBLICACIÓN ESPECÍFICA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public viewComments(event: any = null) {
    if (event) {
      event.preventDefault();
    }
    this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.view_comments, contentData: { pubId: this.quejaDetail.id_publication, comId: this.commentId, replyId: this.replyId, hideBtn: (this.quejaDetail.isTrans == true && this.quejaDetail.transDone == false) } });
  }

  /**
   * METODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * METODO PARA ESCUCHAR LOS CAMBIOS QUE SE DEN EN EL ATRIBUTO QUE VIENE DESDE EL COMPONENTE PADRE:
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      switch (property) {
        case 'showClass':
          if (changes[property].currentValue) {
            this.showClass = changes[property].currentValue;
          }
          break;
      }
    }
  }

  ngOnDestroy() {
    this._dynaContentService.loadDynaContent(null);
    this.subscriptor.unsubscribe();
  }
}
