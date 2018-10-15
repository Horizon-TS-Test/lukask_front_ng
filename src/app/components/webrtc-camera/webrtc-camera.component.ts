import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges, OnChanges, NgZone } from '@angular/core';
import { Device } from '../../interfaces/device.interface';
import { NotifierService } from '../../services/notifier.service';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { ImageCapture } from 'image-capture';
import { MediaFile } from '../../interfaces/media-file.interface';
import { WebrtcSocketService } from '../../services/webrtc-socket.service';
import { UserService } from '../../services/user.service';

import * as Snackbar from 'node-snackbar';
import * as loadImage from 'blueimp-load-image';

@Component({
  selector: 'app-webrtc-camera',
  templateUrl: './webrtc-camera.component.html',
  styleUrls: ['./webrtc-camera.component.css'],
  providers: [WebrtcSocketService]

})
export class WebrtcCameraComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() startCamera: boolean;
  @Input() backCamera: boolean;
  @Input() streamOwnerId: string;
  @Input() pubId: string;
  @Input() maxSnapShots: number;
  @Output() closeEmitter = new EventEmitter<boolean>();

  private snapShotCounter: number;
  private _frontCamera: Device;
  private _backCamera: Device;
  private _video: any;
  private _navigator: any;
  private localStream: any;
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
    private _userService: UserService,
    private _ngZone: NgZone
  ) {
    this.snapShotCounter = 0;

    this._frontCamera = { id: "", description: "" };
    this._backCamera = { id: "", description: "" };
    this.swapCamera = false;
    this.transmissionOn = false;

    //LISTEN FOR ANY CAMERA EVENT:
    this.subscription = this._notifierService._cameraAction.subscribe(
      (cameraAction: number) => {
        switch (cameraAction) {
          case CAMERA_ACTIONS.start_camera:
            this.startCamera = true;
            break;
          case CAMERA_ACTIONS.snap_shot:
            if (this.snapShotCounter < this.maxSnapShots) {
              this.takeSnapShot();
            }
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
            //MÉTODO UTILIZADO PARA EL STREAMING
            this.transmissionOutsideAngular();
            break;
          case CAMERA_ACTIONS.pause_transmision:
            //MÉTODO UTILIZADO PARA EL STREAMING
            break;
          case CAMERA_ACTIONS.stop_transmision:
            //MÉTODO UTILIZADO PARA EL STREAMING
            this._webrtcSocketService.closeTransmissionCnn();
            break;
          case CAMERA_ACTIONS.join_transmision:
            //MÉTODO UTILIZADO PARA EL STREAMING
            if (this.streamOwnerId) {
              this.joinOutsideAngular();
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
    this.backCamera = (!this.backCamera) ? false : this.backCamera;

    if (this.streamOwnerId) {
      this.joinOutsideAngular();
    }
    else {
      navigator.mediaDevices.enumerateDevices().then((data) => {
        this.getDevices(data);
      }).catch(this.handleError);
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
   * MÉTODO PARA ABRIR UNA CÁMARA POR DEFECTO
   * @param doneCallback RETORNA UN CALLBACK PARA CREAR UN PROCESO ASÍNCRONO FUERA DEL CONTEXTO DE ANGULAR
   */
  openSomeCamera(doneCallback: () => void) {
    if (this.backCamera) {
      this.startBackLiveCam();
    }
    else {
      this.startFrontLiveCam();
    }

    doneCallback();
  }

  /**
   * MÉTODO PARA ENCONTRAR LOS DIFERENTES DISPOSITIVOS DE AUDIO Y VIDEO:
   * @param deviceInfos Información  de los dispositivos
   */
  getDevices(deviceInfos: any) {
    let counter = 0;
    deviceInfos.forEach((device) => {
      if (device.kind === "videoinput") {
        this.setCamera(device);
      }
      counter++;
      if (counter == deviceInfos.length) {

        /**
         * PARA INICIAR LA TRASMISIÓN FUERA DEL CONTEXTO DE ANGULAR
        */
        //REF: https://github.com/angular/angular/issues/20970
        this._ngZone.runOutsideAngular(() => {
          this.openSomeCamera(() => {
            this._ngZone.run(() => {
              console.log("[WERTC-CAMERA COMPONENT]: Proceso ejecutado fuera del contexto de Angular");
            });
          });
        });
      }
    });
  }

  /**
   * MÉTODO PARA INICIAR LA CAPTURA DE LA CÁMARA:
   */
  startLiveCamp(infoCamp: Device) {
    if (this.startCamera != false) {
      this._navigator = <any>navigator;
      this._navigator.getUserMedia = (this._navigator.getUserMedia || this._navigator.webkitGetUserMedia || this._navigator.mozGetUserMedia || this._navigator.msGetUserMedia);
      this._navigator.mediaDevices.getUserMedia({
        video: { deviceId: infoCamp.id ? { exact: infoCamp.id } : undefined }
      }).then((stream) => {
        this.localStream = stream;
        this._video.srcObject = stream;

        this.mediaStreamTrack = stream.getVideoTracks()[0];
        this.imageCapture = new ImageCapture(this.mediaStreamTrack, stream);
      }).catch(error => console.error('getUserMedia() error:', error));
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
    else {
      this.startFrontLiveCam();
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
        let fixedBlob;

        loadImage.parseMetaData(blob, (data) => {
          let blobOrientation;
          if (data.exif) {
            blobOrientation = data.exif.get('Orientation');
          }
          loadImage(blob, (img) => {
            img.toBlob((blob) => {
              fixedBlob = blob;
              console.log("[WEBRTC-CAMERA COMPONENT] - IMAGE CAPTURE WITH FIXED ORIENTATION", fixedBlob);

              this.snapShot = {
                mediaFileUrl: URL.createObjectURL(fixedBlob),
                mediaFile: fixedBlob,
                removeable: true
              }
              Snackbar.show({ text: "Imagen capturada correctamente", pos: 'bottom-center', actionText: 'Listo', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
              this._cameraService.notifySnapShot(this.snapShot);

              this.snapShotCounter++;
              if (this.snapShotCounter == this.maxSnapShots) {
                this.closeEmitter.emit(true);
              }
            });
          }, {
              canvas: true,
              orientation: blobOrientation
            }
          );
        });

      });
    }
  }

  /**
   * MÉTODO PARA INCIAR LA CONEXIÓN AL SOCKET DE KURENTO CLIENT:
   */
  connectToStreamingClient() {
    return this._webrtcSocketService.connecToKurento(this._userService.userProfile.id, this.pubId, this._video);
  }

  startTransmission(someCallBack: () => void) {
    if (this.pubId && !this.streamOwnerId && !this.transmissionOn) {
      this._userService.onStreaming = true;

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

    someCallBack();
  }

  /**
   * MÉTODO PARA UNIRSE A UNA TRANSMISIÓN
   */
  joinTransmission(doSomeCallback: () => void) {
    this._userService.onStreaming = true;

    this.connectToStreamingClient()
      .then((response: boolean) => {
        if (response) {
          this._webrtcSocketService.startViewer(this.streamOwnerId);
        }
      })
      .catch((response: boolean) => {
        console.log("[WERTC-CAMERA COMPONENT]: NO SE HA PODIDO CONECTAR A LA TRANSMISIÓN, FALLO EN LA CONEXIÓN");
      });

    doSomeCallback();
  }

  /**
   * PARA INICIAR LA TRASMISIÓN FUERA DEL CONTEXTO DE ANGULAR
   */
  transmissionOutsideAngular() {
    //REF: https://github.com/angular/angular/issues/20970
    this._ngZone.runOutsideAngular(() => {
      this.startTransmission(() => {
        this._ngZone.run(() => {
          console.log("[WERTC-CAMERA COMPONENT]: Proceso ejecutado fuera del contexto de Angular");
        });
      });
    });
  }

  /**
   * PARA UNIRSE A UNA TRASMISIÓN FUERA DEL CONTEXTO DE ANGULAR
   */
  joinOutsideAngular() {
    //REF: https://github.com/angular/angular/issues/20970
    this._ngZone.runOutsideAngular(() => {
      this.joinTransmission(() => {
        this._ngZone.run(() => {
          console.log("[WERTC-CAMERA COMPONENT]: Proceso ejecutado fuera del contexto de Angular");
        });
      });
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
            this.pubId = changes[property].currentValue;
            this.transmissionOutsideAngular();
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