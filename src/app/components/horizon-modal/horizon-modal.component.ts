import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';

declare var $: any;

@Component({
  selector: 'app-horizon-modal',
  templateUrl: './horizon-modal.component.html',
  styleUrls: ['./horizon-modal.component.css']
})
export class HorizonModalComponent implements OnInit, OnDestroy {
  private self: any;
  private subscriber: Subscription;

  public _ref: any;
  public _dynaContent: DynaContent;
  public contentTypes: any;
  public carouselOptions: any;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService
  ) {
    this.contentTypes = CONTENT_TYPES;

    this.subscriber = this._notifierService._closeModal.subscribe((closeIt: boolean) => {
      this.close(closeIt);
    });
  }

  ngOnInit() {
    this.self = $(".horizon-modal").last();
    this.initCarousel();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._contentService.slideDownUp(this.self);
    }, 100);
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false
    };

    $(".owl-carousel").on("dragged.owl.carousel", (event) => {
      alert("dragged!!!");
    });
  }

  /**
   * MÉTODO PARA DAR EL EFECTO DE DESVANECIMIENTO DEL MODAL PARA LUEGO CERRARLO:
   */
  closeModal() {
    this._contentService.slideDownUp(this.self, false);

    setTimeout(() => {
      this.removeObject();
    }, 300);
  }

  /**
   * MÉTODO PARA CERRAR EL MODAL DESDE UN BOTÓN HIJO:
   * @param closeEvent DATO QUE LLEGA DEL EVENT EMITTER
   */
  close(closeEvent: Boolean) {
    if (closeEvent) {
      this.closeModal();
    }
  }

  /**
   * MÉTODO PARA CERRAR EL MODAL AL DAR CLICK FUERA DEL MISMO:
   * @param event 
   */
  onClickClose(event: any) {
    event.preventDefault();
    this.closeModal();
  }

  /**
   * MÉTODO PARA ELIMINAR LA REFERENCIA DE ESTE COMPONENTE DINÁMICO DENTRO DE TODA LA APP
   */
  removeObject() {
    this._ref.destroy();
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}