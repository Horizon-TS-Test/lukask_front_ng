import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';

declare var $: any;

@Component({
  selector: 'media-streaming',
  templateUrl: './media-streaming.component.html',
  styleUrls: ['./media-streaming.component.css']
})
export class MediaStreamingComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;

  private _CLOSE = 1;

  public cameraActions: any;
  public _ref: any;
  public matButtons: HorizonButton[];
  public carouselOptions: any;

  constructor(
    private _notifierService: NotifierService
  ) {
    this.cameraActions = CAMERA_ACTIONS;

    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        parentContentType: 1,
        action: this._CLOSE,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    this.initCarousel();
  }

  ngAfterViewInit() { }

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

  sendCameraAction(event: any, action: number) {
    if (event) {
      event.preventDefault();
    }
    this._notifierService.notifyCameraAction(action);
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._CLOSE:
        this.sendCameraAction(event, this.cameraActions.stop_stream);
        this.closeModal.emit(true);
        break;
    }
  }

}
