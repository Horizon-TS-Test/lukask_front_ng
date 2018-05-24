import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Device } from '../../interfaces/device.interface';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { ContentService } from '../../services/content.service';

declare var $: any;

@Component({
  selector: 'app-webrtc-camera',
  templateUrl: './webrtc-camera.component.html',
  styleUrls: ['./webrtc-camera.component.css']
})
export class WebrtcCameraComponent implements OnInit, OnDestroy, AfterViewInit {
  private _frontCamera: Device;
  private _backCamera: Device;
  private _canvas: any;
  private _video: any;
  private _navigator: any;
  private _width: any;
  private _height: any;
  private localStream: any;

  private subscription: Subscription;

  constructor(
    private _notifierService: NotifierService,
    private _cameraService: CameraService,
    private _contentService: ContentService,
  ) {
    this._frontCamera = { id: "", description: "" };
    this._frontCamera = { id: "", description: "" };

    //LISTEN FOR ANY CAMERA EVENT:
    this.subscription = this._notifierService._cameraAction.subscribe(
      (cameraAction: number) => {
        switch (cameraAction) {
          case CAMERA_ACTIONS.snap_shot:
            this.takeSnapShot();
            break;
          case CAMERA_ACTIONS.front_camera:
            this.startFrontLiveCam();
            break;
          case CAMERA_ACTIONS.back_camera:
            this.startBackLiveCam();
            break;
          case CAMERA_ACTIONS.start_video:
            break;
          case CAMERA_ACTIONS.flash_on:
            break;
          case CAMERA_ACTIONS.flash_off:
            break;
          case CAMERA_ACTIONS.flash_auto:
            break;
          case CAMERA_ACTIONS.stop_stream:
            this.stopStream();
            break;
        }
      }
    );
    /////
  }

  ngOnInit() {
    this.initVariables();
  }

  ngAfterViewInit() {
    navigator.mediaDevices.enumerateDevices().then((data) => {
      console.log("dispositivos", data);
      this.getDivices(data);
    }).catch(this.handleError);

    this.startFrontLiveCam();
  }

  centerStream() {
    this._contentService.centerElement($("#video"));
    this._contentService.centerElement($("#canvas"));
  }

  /**
   * Inicializar variables
   */
  initVariables() {
    this._video = document.querySelector("#video");
    this._canvas = document.querySelector("#canvas");

    this._width = $("#video").width();
    this._height = $("#video").height();

    this._canvas.setAttribute('width', this._width);
    this._canvas.setAttribute('height', this._height);

    this._canvas.style.display = 'none';
  }

  /**
   * Iniciar transmición
   */
  startLiveCamp(infoCamp: Device) {
    this._navigator = <any>navigator;
    this._navigator.getUserMedia = (this._navigator.getUserMedia || this._navigator.webkitGetUserMedia || this._navigator.mozGetUserMedia || this._navigator.msGetUserMedia);
    this._navigator.mediaDevices.getUserMedia({
      video: { deviceId: infoCamp.id ? { exact: infoCamp.id } : undefined, width: this._width, height: this._height }
    }).then((stream) => {
      console.log("stream", stream)
      this.localStream = stream;
      this._video.srcObject = stream;
    })
  }

  /**
   * Deterner transmición
   */
  stopStream() {
    if (this.localStream !== undefined) {
      const tracks = this.localStream.getTracks();
      tracks.forEach((tracks) => {
        tracks.stop();
      });
    }
  }

  /**
   * obtener captura del video en transmición
   */
  takeSnapShot() {
    this._canvas.getContext('2d').drawImage(this._video, 0, 0, this._width, this._height);
    this._video.style.display = 'none';
    this._canvas.style.display = 'block';

    let snapShot = this._canvas.toDataURL('image/png');
    this._cameraService.notifySnapShot(snapShot);

    this.stopStream();
  }

  /**
   * Obtiene los dispositivos disponibles hardware disponibles del dispositivo(smartphone o PC) que esta ejecutando la aplicación.
   * @param deviceInfos Información  de los dispositivos
   */
  getDivices(deviceInfos: any) {
    deviceInfos.forEach((device) => {
      if (device.kind === "videoinput") {
        this.setCamera(device);
      }
    });
  }

  /**
   * Error al obtener los dispositivos del dispositivo(smartphone o PC)
   * @param error
   */
  handleError(error) {
    console.log(error);
  }

  /**
   * Permite elegir las cámaras disponibles.
   * @param device
   */
  setCamera(device: any) {
    if (device.label.indexOf("back") > -1) {
      this._backCamera = { id: device.deviceId, description: "Posterior" }
    } else if (device.label.indexOf("front") > -1) {
      this._frontCamera = { id: device.deviceId, description: "Frontal" }
    } else {
      let textLabel = (device.label.length > 6) ? device.label.substr(0, 6) + "..." : device.label;
      this._frontCamera = { id: device.deviceId, description: textLabel }
    }
  }

  /**
   * Iniciar transmición con la cámara frontal
   */
  startFrontLiveCam() {
    this.stopStream();
    this.startLiveCamp(this._frontCamera);
  }

  /**
   * Inicicar transmición con la cámara trasera.
   */
  startBackLiveCam() {
    this.stopStream();
    this.startLiveCamp(this._backCamera);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}