import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Device } from '../../interfaces/device.interface';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';

import { ImageCapture } from 'image-capture';
import { MediaFile } from '../../interfaces/media-file.interface';

declare var $: any;

@Component({
  selector: 'app-webrtc-camera',
  templateUrl: './webrtc-camera.component.html',
  styleUrls: ['./webrtc-camera.component.css']
})
export class WebrtcCameraComponent implements OnInit, OnDestroy, AfterViewInit {
  private _frontCamera: Device;
  private _backCamera: Device;
  private _video: any;
  private _navigator: any;
  private localStream: any;
  private backCamera: boolean;
  public snapShot: MediaFile;
  public swapCamera: boolean;
  private mediaStreamTrack: any;
  private imageCapture: any;
  private subscription: Subscription;

  constructor(
    private _notifierService: NotifierService,
    private _cameraService: CameraService,
  ) {
    this._frontCamera = { id: "", description: "" };
    this._backCamera = { id: "", description: "" };
    this.swapCamera = false;
    this.backCamera = false;

    //LISTEN FOR ANY CAMERA EVENT:
    this.subscription = this._notifierService._cameraAction.subscribe(
      (cameraAction: number) => {
        switch (cameraAction) {
          case CAMERA_ACTIONS.snap_shot:
            this.takeSnapShot();
            break;
          case CAMERA_ACTIONS.change_camera:
            if (this.backCamera) {
              this.startFrontLiveCam();
            }
            else {
              this.startBackLiveCam();
            }
            break;
          case CAMERA_ACTIONS.start_video:
            break;
          case CAMERA_ACTIONS.flash_on:
            break;
          case CAMERA_ACTIONS.flash_off:
            break;
          case CAMERA_ACTIONS.init_transmision:
            //AQUÍ DEBES LLAMAR A TUS MÉTODOS PARA LA TRANSMISIÓN DENNYS :D 
            break;
          case CAMERA_ACTIONS.pause_transmision:
            //AQUÍ DEBES LLAMAR A TUS MÉTODOS PARA LA TRANSMISIÓN DENNYS :D
            break;
          case CAMERA_ACTIONS.stop_transmision:
            //AQUÍ DEBES LLAMAR A TUS MÉTODOS PARA LA TRANSMISIÓN DENNYS :D
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
      this.getDevices(data);
    }).catch(this.handleError);

    this.startFrontLiveCam();
  }

  /**
   * Inicializar variables
   */
  initVariables() {
    this._video = document.querySelector("#video");
  }

  /**
   * MÉTODO PARA INICIAR LA CAPTURA DE LA CÁMARA:
   */
  startLiveCamp(infoCamp: Device) {
    this._navigator = <any>navigator;
    this._navigator.getUserMedia = (this._navigator.getUserMedia || this._navigator.webkitGetUserMedia || this._navigator.mozGetUserMedia || this._navigator.msGetUserMedia);
    this._navigator.mediaDevices.getUserMedia({
      video: { deviceId: infoCamp.id ? { exact: infoCamp.id } : undefined }
    }).then((stream) => {
      console.log("stream", stream)
      this.localStream = stream;
      this._video.srcObject = stream;

      this.mediaStreamTrack = stream.getVideoTracks()[0];
      this.imageCapture = new ImageCapture(this.mediaStreamTrack);
      console.log(this.imageCapture);
    }).catch(error => console.error('getUserMedia() error:', error));
  }

  /**
   * MÉTODO PARA ENCONTRAR LOS DIFERENTES DISPOSITIVOS DE AUDIO Y VIDEO:
   * @param deviceInfos Información  de los dispositivos
   */
  getDevices(deviceInfos: any) {
    deviceInfos.forEach((device) => {
      if (device.kind === "videoinput") {
        this.setCamera(device);
      }
    });
  }

  /**
   * MÉTODO PARA ESCOGER ENTRE LAS CÁMARAS DE VIDEO ENCONTRADAS
   * @param device
   */
  setCamera(device: any) {
    if (device.label.indexOf("back") > -1) {
      this._backCamera = { id: device.deviceId, description: "Posterior" }
      this.swapCamera = true;
    } else if (device.label.indexOf("front") > -1) {
      this._frontCamera = { id: device.deviceId, description: "Frontal" }
    } else {
      let textLabel = (device.label.length > 6) ? device.label.substr(0, 6) + "..." : device.label;
      this._frontCamera = { id: device.deviceId, description: textLabel }
    }
  }

  /**
   * MÉTODO PARA INICIAR LA CAPTURA DE IMAGEN DE LA CÁMARA FRONTAL:
   */
  startFrontLiveCam() {
    this.backCamera = false;
    this.stopStream();
    this.startLiveCamp(this._frontCamera);
  }

  /**
   * MÉTODO PARA INICIAR LA CAPTURA DE IMAGEN DE LA CÁMARA TRASERA:
   */
  startBackLiveCam() {
    if (this.swapCamera) {
      this.backCamera = true;
      this.stopStream();
      this.startLiveCamp(this._backCamera);
    }
  }

  /**
   * MÉTODO PARA DETENER LA CAPTURA DE IMAGEN DE LA CÁMARA:
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
   * MÉTODO PARA OBTENER UNA CAPTURA DE IMAGEN (SNAP SHOT) DEL STREAM
   */
  takeSnapShot() {
    if (this.imageCapture) {
      this.imageCapture.takePhoto().then((blob: any) => {
        console.log(blob);
        this.snapShot = {
          mediaFileUrl: URL.createObjectURL(blob),
          mediaFile: blob
        }
        this._cameraService.notifySnapShot(this.snapShot);
      });
    }
  }

  ///*****************************AQUÍ DEBES LLAMAR A TUS MÉTODOS PARA LA TRANSMISIÓN DENNYS :D********
  /////////////////////////////////////////////////////////////////////////////////////////////////////

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Error al obtener los dispositivos del dispositivo(smartphone o PC)
   * @param error
   */
  handleError(error) {
    console.log(error);
  }
}