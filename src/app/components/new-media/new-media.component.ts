import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

@Component({
  selector: 'new-media',
  templateUrl: './new-media.component.html',
  styleUrls: ['./new-media.component.css'],
  providers: [NotifierService]
})
export class NewMediaComponent implements OnInit {
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
  }

  /**
   * MÉTODO PARA ENVIAR LAS DISTINTAS ACCIONES A EJECUTAR EN EL 
   * COMPONENTE QUE ABRE LA CÁMARA PARA TOMAR FOTOGRAFÍAS:
   * @param event 
   * @param action EL TIPO DE ACCIÓN A REALIZAR. VER EL ARCHIVO ../../config/camera-actions.ts
   */
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
