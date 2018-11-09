import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { CameraActionService } from 'src/app/services/camera-action.service';
import { CordovaCameraService } from 'src/app/services/cordova-camera.service';

@Component({
  selector: 'new-media',
  templateUrl: './new-media.component.html',
  styleUrls: ['./new-media.component.css'],
})
export class NewMediaComponent implements OnInit, OnChanges, OnDestroy {
  @Input() maxSnapShots: number;
  @Input() showClass: string;
  @Input() backCamera: boolean;
  @Output() closeModal: EventEmitter<boolean>;

  public cameraActions: any;
  public _ref: any;
  public matButtons: HorizonButton[];
  public carouselOptions: any;

  constructor(
    private _cameraActionService: CameraActionService    
  ) {
    this.cameraActions = CAMERA_ACTIONS;

    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        action: ACTION_TYPES.close,
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
  private initCarousel() {
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
  public sendCameraAction(event: any, action: number) {
    if (event) {
      event.preventDefault();
    }

    this._cameraActionService.sendCameraAction(action);
  }

  /**
   * MÉTODO PARA ESCUCHAR LOS CAMBIOS QUE SE DEN EN EL ATRIBUTO QUE VIENE DESDE EL COMPONENTE PADRE:
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      switch (property) {
        case 'showClass':
          if (changes[property].currentValue !== undefined) {
            this.showClass = changes[property].currentValue;
          }
          break;
      }
    }
  }

  /**
   * MÉTODO PARA CAPTAR EL EVENTO DEL COMPONENTE HIJO
   * @param event 
   */
  public getChildEvent(event: boolean) {
    if (event) {
      this.closeModal.emit(true);
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        this.sendCameraAction(event, this.cameraActions.stop_stream);
        this.closeModal.emit(true);
        break;
    }
  }

  ngOnDestroy() {
    this._cameraActionService.sendCameraAction(null);
  }
}
