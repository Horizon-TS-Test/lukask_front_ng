import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { CameraActionService } from 'src/app/services/camera-action.service';
import * as _setIntervalPlus from 'setinterval-plus';
import * as Snackbar from 'node-snackbar';
import { CONTENT_TYPES } from 'src/app/config/content-type';


@Component({
  selector: 'new-media',
  templateUrl: './new-media.component.html',
  styleUrls: ['./new-media.component.css'],
})
export class NewMediaComponent implements OnInit, OnChanges, OnDestroy {
  @Input() opActionMedia: number;
  @Input() maxSnapShots: number;
  @Input() showClass: string;
  @Input() backCamera: boolean;
  @Output() closeModal: EventEmitter<boolean>;

  public cameraActions: any;
  public _ref: any;
  public matButtons: HorizonButton[];
  public carouselOptions: any;
  public actionTypes: any;
  public classRecordering: string;
  public classBttnRecHidden: string;
  public classObjHidden:string;
  public stateRec: string;
  public timeRec: string;
  public actionResOrPause:number;
  private _cameraready: boolean;
  private _recording:boolean;
  private _timer: any;
  private _seconds: number;
  private _minutes: number;
  private _iconPause: string;
  private _resumen: boolean;
  private _hidden:string = 'obj-hidden';
  private _recordering: string = 'recorder';
  private _bttnRecHidden: string = 'bttnHiddenRecording';



  constructor(
    private _cameraActionService: CameraActionService
  ) {
    this.cameraActions = CAMERA_ACTIONS;
    this.actionTypes = ACTION_TYPES;
    this.closeModal = new EventEmitter<boolean>();
    this.classBttnRecHidden = this._bttnRecHidden;
    this._bttnRecHidden = "";
    this._cameraready = false;
    this.stateRec = "Grabando";
    this.timeRec = "00:00";
    this._seconds = 0;
    this._minutes = 0;
    this._iconPause = "h";
    this._resumen = false;
    this._recording= false;
    this.actionResOrPause = CAMERA_ACTIONS.pause_recorder;
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
    console.log("sendCameraAction", action);
    if (event) {
      event.preventDefault();
    }

    //Para el caso de iniciar la grabacion
    if (action == CAMERA_ACTIONS.init_recorder && this._cameraready) {
      this.classRecordering = this._recordering;
      this.classBttnRecHidden = "";
      this.classObjHidden = this._hidden;
      this._recording = true;

      this._minutes = 0;
      this._seconds = 0;
      this._timer = new _setIntervalPlus(() => {
        this.calcTimer();
      }, 1000);

    } else if (action == CAMERA_ACTIONS.stop_recorder && this._cameraready) { //En el caso de detener la grabacion
      this.stateRec = "Finalizando";
      this._recording = false;
      this.classRecordering = "";
      this.classBttnRecHidden = this._bttnRecHidden;
      this._timer.stop();
    }

    //En el caso de reanudar la grabacion
    if (this._timer && this._resumen && CAMERA_ACTIONS.resumen_recorder == action) {
      console.log("Entro al resumen");
      this._iconPause = "h";
      this.actionResOrPause = CAMERA_ACTIONS.pause_recorder;
      this._resumen = false;
      this.stateRec = "Grabando";
      this._timer.resume();
    }

    //En el caso de detener la grabacion
    if (this._timer && action == CAMERA_ACTIONS.pause_recorder) {
      this.actionResOrPause = CAMERA_ACTIONS.resumen_recorder;
      this._iconPause = "g";
      this._resumen = true;
      this.stateRec = "Pausado";
      this._timer.pause();
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

  /***
   * Validamos que la camara este lista para usarse.
   */
  public setCameraReady(event: boolean) {
    if (event) {
      this._cameraready = event;
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        console.log("Proceso de cerrar modal de video....");
        if (this._recording) {

          Snackbar.show({ text: "Existe un proceso de grabación en curso, finalice por favor", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });
        } else {
          
          this.sendCameraAction(event, this.cameraActions.stop_stream);
          this.closeModal.emit(true);
        }
        break;
    }
  }

   /**
   * Proceso para ver el avance de la grabacion y detener cuando se cumplan los 3 minutos
   */
  private calcTimer() {
    this._seconds++;
    let seconds: string = "";

    if (this._seconds == 60) {
      this._minutes++;
      this._seconds = 0;
    }

    seconds = this._seconds < 10 ? "0" + this._seconds.toString() : this._seconds.toString();
    this.timeRec = "0" + this._minutes.toString() + ':' + seconds.toString();
    if (this._minutes == 3) {
      this._cameraActionService.sendCameraAction(CAMERA_ACTIONS.stop_recorder);
      this._timer.stop();
    }
  }

  ngOnDestroy() {
    this._cameraActionService.sendCameraAction(null);
  }
}
