import { Component, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange, Input, OnDestroy } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { MediaFile } from '../../interfaces/media-file.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from '../../../../node_modules/rxjs';

declare var $: any;

@Component({
  selector: 'media-streaming',
  templateUrl: './media-streaming.component.html',
  styleUrls: ['./media-streaming.component.css']
})
export class MediaStreamingComponent implements OnInit, OnChanges, OnDestroy {
  @Input() startCamera: boolean;
  @Input() initTrans: boolean;
  @Input() streamOwnerId: string;
  @Input() pubId: string;
  @Output() closeModal = new EventEmitter<any>();

  private subscriber: Subscription;
  private ANIMATE_BTN_H: string = "animated-btn-h";
  private ANIMATE_IN: string = "animate-in";
  private ANIMATE_BTN_V: string = "animated-btn-v";
  private ANIMATE_OUT: string = "animate-out";
  private animatedClass: string;

  public cameraActions: any;
  public _ref: any;
  public matButtons: HorizonButton[];
  public defaultView: MediaFile;
  public carouselOptions: any;

  constructor(
    private _notifierService: NotifierService
  ) {
    this.cameraActions = CAMERA_ACTIONS;
    this.animatedClass = this.ANIMATE_BTN_H + " " + this.ANIMATE_IN;
  }

  ngOnInit() {
    this.initCarousel();
    this.initButtons();
    this.subscribeBtnEmitter();
  }

  ngAfterViewInit() { }

  initButtons() {
    if (this.streamOwnerId) {
      this.matButtons = [
        {
          action: ACTION_TYPES.viewComments,
          icon: 'v',
          customIcon: true,
          class: this.animatedClass
        },
        {
          action: ACTION_TYPES.close,
          icon: "close"
        }
      ];
    }
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  private initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false
    };
  }

  private subscribeBtnEmitter() {
    this._notifierService.initShowBtnEmitter();
    this.subscriber = this._notifierService._showHorizonMaterialBtn
      .subscribe((showBtn: boolean) => {
        if (showBtn == true) {
          this.animatedClass = this.ANIMATE_BTN_H + " " + this.ANIMATE_IN;
        }
        else {
          this.animatedClass = this.ANIMATE_BTN_V + " " + this.ANIMATE_OUT;
        }
        this.initButtons();
      });
  }

  /**
   * MÉTODO PARA ENVIAR LAS DISTINTAS ACCIONES A EJECUTAR EN EL STREAMING:
   * @param event 
   * @param action EL TIPO DE ACCIÓN A REALIZAR. VER EL ARCHIVO ../../config/camera-actions.ts
   */
  public sendCameraAction(event: any, action: number) {
    if (event) {
      event.preventDefault();
    }
    if (action === this.cameraActions.stop_transmision) {
      this.closeModal.emit(ACTION_TYPES.close);
    }
    else {
      this._notifierService.notifyCameraAction(action);
    }
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      console.log('Previous:', changes[property].previousValue);
      console.log('Current:', changes[property].currentValue);
      console.log('firstChange:', changes[property].firstChange);

      switch (property) {
        case 'initTrans':
          if (changes[property].currentValue && changes[property].currentValue == ACTION_TYPES.pubStream) {
            this.sendCameraAction(null, this.cameraActions.init_transmision);
          }
          break;
        case 'startCamera':
          if (changes[property].currentValue == true) {
            this.sendCameraAction(null, this.cameraActions.start_camera);
          }
          else if (changes[property].currentValue == false) {
            this.sendCameraAction(null, this.cameraActions.stop_stream);
          }
          break;
      }
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.viewComments:
        this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_comments, contentData: { pubId: this.pubId, halfModal: true } });
        break;
      case ACTION_TYPES.close:
        this.sendCameraAction(event, this.cameraActions.stop_stream);
        this.closeModal.emit(true);
        break;
    }
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
    this._notifierService.closeShowBtnEmitter();
  }
}
