import { Component, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange, Input } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';

@Component({
  selector: 'media-streaming',
  templateUrl: './media-streaming.component.html',
  styleUrls: ['./media-streaming.component.css']
})
export class MediaStreamingComponent implements OnInit, OnChanges {
  @Input() initStream: boolean;
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

  ngAfterViewInit() {
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
   * MÉTODO PARA ENVIAR LAS DISTINTAS ACCIONES A EJECUTAR EN EL STREAMING:
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
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {

    for (let property in changes) {
      if (property === 'initStream') {
        console.log('Previous:', changes[property].previousValue);
        console.log('Current:', changes[property].currentValue);
        console.log('firstChange:', changes[property].firstChange);

        if (changes[property].currentValue == true) {
          this.sendCameraAction(null, this.cameraActions.start_camera);
        }
        else if (changes[property].currentValue == false) {
          this.sendCameraAction(null, this.cameraActions.stop_stream);
        }
      }
    }
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
