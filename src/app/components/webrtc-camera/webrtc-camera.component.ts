import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Device } from '../../interfaces/device.interface';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';

import { ImageCapture } from 'image-capture';
import { MediaFile } from '../../interfaces/media-file.interface';
import { WebrtcSocketService } from '../../services/webrtc-socket.service';
import { UserService } from '../../services/user.service';

declare var $: any;

@Component({
  selector: 'app-webrtc-camera',
  templateUrl: './webrtc-camera.component.html',
  styleUrls: ['./webrtc-camera.component.css'],
  providers: [WebrtcSocketService]
})
export class WebrtcCameraComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() startCamera: boolean;

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
  private opAcctionCamera:number;

  constructor(
    private _notifierService: NotifierService,
    private _cameraService: CameraService,
    private _webrtcSocketService: WebrtcSocketService,
    private _userService: UserService
  ) {
    this._frontCamera = { id: "", description: "" };
    this._backCamera = { id: "", description: "" };
    this.swapCamera = false;
    this.backCamera = false;

    //LISTEN FOR ANY CAMERA EVENT:
    this.subscription = this._notifierService._cameraAction.subscribe(
      (cameraAction: number) => {
        this.opAcctionCamera = cameraAction;
        switch (cameraAction) {
          case CAMERA_ACTIONS.start_camera:
            //this.startCamera = true;
            this.startFrontLiveCam();
            break;
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
            console.log("Inicio la transmicion")
            this._webrtcSocketService.presenter(this._backCamera, this._frontCamera);
            break;
          case CAMERA_ACTIONS.pause_transmision:
            //AQUÍ DEBES LLAMAR A TUS MÉTODOS PARA LA TRANSMISIÓN DENNYS :D
            break;
          case CAMERA_ACTIONS.stop_transmision:
            //AQUÍ DEBES LLAMAR A TUS MÉTODOS PARA LA TRANSMISIÓN DENNYS :D
            console.log("cameraAction", cameraAction)
            this._webrtcSocketService.stop();
            break;
          case CAMERA_ACTIONS.join_transmision:
            this._webrtcSocketService.startViewer();
            break;
          case CAMERA_ACTIONS.stop_stream:
            this.startCamera = false;
            this.stopStream();
            break;
        }
      }
    );
  }

  ngOnInit() {
    this.initVariables();
    console.log("startCamera", this.startCamera);
    this.connectTosocket();
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
    if (!(this.startCamera == false)) {
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
      console.log("back", device)
      this._backCamera = { id: device.deviceId, description: "Posterior" }
      this.swapCamera = true;
    } else if (device.label.indexOf("front") > -1) {
      console.log("front", device)
      this._frontCamera = { id: device.deviceId, description: "Frontal" }
    } else {
      console.log("default camera", device);
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
  connectTosocket(){
    console.log("userId..", this._userService.userProfile);
    this._webrtcSocketService.connecToKurento(this._userService.userProfile.id);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopStream();
  }

  /**
   * Error al obtener los dispositivos del dispositivo(smartphone o PC)
   * @param error
   */
  handleError(error) {
    console.log(error);
  }
}