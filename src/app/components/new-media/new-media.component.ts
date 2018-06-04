import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

declare var $: any;

@Component({
  selector: 'new-media',
  templateUrl: './new-media.component.html',
  styleUrls: ['./new-media.component.css'],
  providers: [NotifierService]
})
export class NewMediaComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;

  private _CLOSE = 1;
  private self: any;

  public cameraActions: any;
  public _ref: any;
  public matButtons: HorizonButton[];

  constructor(
    private _contentService: ContentService,
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
    this.self = $("#personal-media");
  }

  ngAfterViewInit() { }

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
