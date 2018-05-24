import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';

declare var $: any;

@Component({
  selector: 'app-new-media',
  templateUrl: './new-media.component.html',
  styleUrls: ['./new-media.component.css'],
  providers: [NotifierService]
})
export class NewMediaComponent implements OnInit {
  private self: any;
  public _ref: any;

  public cameraActions: any;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService
  ) {
    this.cameraActions = CAMERA_ACTIONS;
  }

  ngOnInit() {
    this.self = $("#personal-media");
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._contentService.slideDownUp(this.self);
    }, 100);
  }

  removeObject() {
    this._ref.destroy();
  }

  close(event) {
    this.sendCameraAction(event, this.cameraActions.stop_stream);

    this._contentService.slideDownUp(this.self, false);

    setTimeout(() => {
      this.removeObject();
    }, 300);
  }

  sendCameraAction(event: any, action: number) {
    if (event) {
      event.preventDefault();
    }

    this._notifierService.notifyCameraAction(action);
  }

}
