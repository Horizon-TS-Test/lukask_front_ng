import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Device } from '../../interfaces/device.interface';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';

import { ImageCapture } from 'image-capture';
import { MediaFile } from '../../interfaces/media-file.interface';
import { WebrtcSocketService } from '../../services/webrtc-socket.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-webrtc-camera',
  templateUrl: './webrtc-camera.component.html',
  styleUrls: ['./webrtc-camera.component.css'],
  providers: [WebrtcSocketService]

})
export class WebrtcCameraComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() startCamera: boolean;
  @Input() streamOwnerId: string;
  @Input() pubId: string;
  @Output() fileEmitter = new EventEmitter<MediaFile>();

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
  private transmissionOn: boolean;

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
    this.transmissionOn = false;

    //LISTEN FOR ANY CAMERA EVENT:
    this.subscription = this._notifierService._cameraAction.subscribe(
      (cameraAction: number) => {
        switch (cameraAction) {
          case CAMERA_ACTIONS.start_camera:
            this.startCamera = true;
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
            this.startTransmission();
            break;
          case CAMERA_ACTIONS.pause_transmision:
            //AQUÍ DEBES LLAMAR A TUS MÉTODOS PARA LA TRANSMISIÓN DENNYS :D
            break;
          case CAMERA_ACTIONS.stop_transmision:
            //AQUÍ DEBES LLAMAR A TUS MÉTODOS PARA LA TRANSMISIÓN DENNYS :D
            this._webrtcSocketService.closeTransmissionCnn();
            break;
          case CAMERA_ACTIONS.join_transmision:
            if (this.streamOwnerId) {
              this.joinTransmission();
            }
            break;
          case CAMERA_ACTIONS.stop_stream:
            this.startCamera = false;
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

    if (this.streamOwnerId) {
      this.joinTransmission();
    }
    else {
      this.startFrontLiveCam();
    }
  }

  /**
   * MÉTODO PARA INICIAR VARIABLES
   */
  initVariables() {
    let videoArray = document.querySelectorAll(".video-camera");
    this._video = videoArray.item(videoArray.length - 1);
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

  /**
   * MÉTODO PARA INCIAR LA CONEXIÓN AL SOCKET DE KURENTO CLIENT:
   */
  connectToStreamingClient() {
    console.log("this.pubId: " + this.pubId);
    return this._webrtcSocketService.connecToKurento(this._userService.userProfile.id, this.pubId, this._video);
  }

  startTransmission() {
    if (this.pubId && !this.transmissionOn) {
      this.connectToStreamingClient()
        .then((response: boolean) => {
          if (response) {
            this.transmissionOn = true;
            this._webrtcSocketService.presenter(this._backCamera, this._frontCamera);
          }
        }).catch((response: boolean) => {
          console.log("[WERTC-CAMERA COMPONENT]: NO SE HA PODIDO INICIAR LA TRANSMISIÓN, FALLO EN LA CONEXIÓN");
        });
    }
  }

  /**
   * MÉTODO PARA UNIRSE A UNA TRANSMISIÓN
   */
  joinTransmission() {
    this.connectToStreamingClient()
      .then((response: boolean) => {
        if (response) {
          this._webrtcSocketService.startViewer(this.streamOwnerId);
        }
      })
      .catch((response: boolean) => {
        console.log("[WERTC-CAMERA COMPONENT]: NO SE HA PODIDO CONECTARSE A LA TRANSMISIÓN, FALLO EN LA CONEXIÓN");
      });
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      switch (property) {
        case 'pubId':
          if (changes[property].currentValue) {
            console.log("pubId" + this.pubId);
            this.pubId = changes[property].currentValue;
            this.startTransmission();
          }
          break;
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this._webrtcSocketService.kurentoWs) {
      this._webrtcSocketService.closeTransmissionCnn();
    }
    else {
      this.stopStream();
    }
  }

  /**
   * Error al obtener los dispositivos del dispositivo(smartphone o PC)
   * @param error
   */
  handleError(error) {
    console.log(error);
  }
}