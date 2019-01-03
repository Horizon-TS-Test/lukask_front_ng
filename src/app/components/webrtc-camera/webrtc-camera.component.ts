import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges, OnChanges, NgZone } from '@angular/core';
import { Device } from '../../interfaces/device.interface';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { MEDIA_TYPES } from '../../config/media-types';
import { Subscription } from 'rxjs';
import { CameraService } from '../../services/camera.service';
import { ImageCapture } from 'image-capture';
import { MediaFile } from '../../interfaces/media-file.interface';
import { WebrtcSocketService } from '../../services/webrtc-socket.service';
import { UserService } from '../../services/user.service';
import { CameraActionService } from 'src/app/services/camera-action.service';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import * as mediaStreamRecorder from 'msr';

import * as Snackbar from 'node-snackbar';
import * as loadImage from 'blueimp-load-image';
import { CONTENT_TYPES } from 'src/app/config/content-type';
import { ASSETS } from 'src/app/config/assets-url';

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
  @Output() cameraReady = new EventEmitter<boolean>();

  private snapShotCounter: number;
  private _frontCamera: Device;
  private _backCamera: Device;
  private _video: any;
  private _navigator: any;
  private localStream: any;
  public snapShot: MediaFile;
  public videoRecorder: MediaFile;
  public swapCamera: boolean;
  private mediaStreamTrack: any;
  private imageCapture: any;
  private subscription: Subscription;
  private transmissionOn: boolean;
  private mediaRecorder: any;
  private initPauseVideo:boolean;
  
  public openCameraGif: string;

  constructor(
    private _cameraActionService: CameraActionService,
    private _cameraService: CameraService,
    private _webrtcSocketService: WebrtcSocketService,
    private _userService: UserService,
    private _dynaContentService: DynaContentService
  ) {
    this.snapShotCounter = 0;

    this._frontCamera = { id: "", description: "" };
    this._backCamera = { id: "", description: "" };
    this.swapCamera = false;
    this.transmissionOn = false;
    this.initPauseVideo = false;
    this.openCameraGif = ASSETS.openCameraAnimation;

    //LISTEN FOR ANY CAMERA EVENT:
    this.subscription = this._cameraActionService.cameraAction$.subscribe(
      (cameraAction: number) => {
        console.log("cameraAction...", cameraAction);
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
            //METODO UTILIZADO PARA EL STREAMING
            this.startTransmission();
            break;
          case CAMERA_ACTIONS.pause_transmision:
            //METODO UTILIZADO PARA EL STREAMING
            break;
          case CAMERA_ACTIONS.stop_transmision:
            //METODO UTILIZADO PARA EL STREAMING
            this._webrtcSocketService.closeTransmissionCnn();
            break;
          case CAMERA_ACTIONS.join_transmision:
            //METODO UTILIZADO PARA EL STREAMING
            if (this.streamOwnerId) {
              this.joinTransmission();
            }
            break;
          case CAMERA_ACTIONS.stop_stream:
            this.startCamera = false;
            this.stopStream();
            break;

          //OPCIONES PARA PROCESO DE GRABACION
          case CAMERA_ACTIONS.init_recorder:
            this.startRecorder();
            break;
          case CAMERA_ACTIONS.pause_recorder:
            this.pauseRecorder();
            break;
          case CAMERA_ACTIONS.stop_recorder:
            this.stopRecorder();
            break;
          case CAMERA_ACTIONS.resumen_recorder:
            this.resumeRecorder();
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
      this.joinTransmission();
    }
  }

  /**
   * METODO PARA INICIAR VARIABLES
   */
  private initVariables() {

    navigator.mediaDevices.enumerateDevices().then((data) => {
      this.getDevices(data);
    }).catch(this.handleError);

    if (!this._video) {
      let videoArray = document.querySelectorAll(".video-camera");
      this._video = videoArray.item(videoArray.length - 1);
    }
  }

  /**
   * METODO PARA ESCOGER ENTRE LAS CÁMARAS DE VIDEO ENCONTRADAS
   * @param device
   */
  private setCamera(device: any, index: any) {
    console.log("establecer camara para transmicion");
    if (device.label.indexOf("back") > -1) {
      this._backCamera = { id: device.deviceId, description: "Posterior" }
      this.swapCamera = true;
    } else if (device.label.indexOf("front") > -1) {
      this._frontCamera = { id: device.deviceId, description: "Frontal" }
    } else if (device.kind === "videoinput" && (index % 2) == 0) {
      this.swapCamera = true;
      this._backCamera = { id: device.deviceId, description: "Posterior" }
    } else if (device.kind === "videoinput" && (index % 2) == 1) {
      console.log("front...");
      this._frontCamera = { id: device.deviceId, description: "Frontal" }
    } else {
      let textLabel = (device.label.length > 6) ? device.label.substr(0, 6) + "..." : device.label;
      textLabel = textLabel === "" ? "Frontal" : textLabel;
      this._frontCamera = { id: device.deviceId, description: textLabel }
    }
  }

  /**
   * METODO PARA ABRIR UNA CÁMARA POR DEFECTO
   */
  private openSomeCamera() {
    if (this.backCamera) {
      this.startBackLiveCam();
    }
    else {
      this.startFrontLiveCam();
    }
  }

  /**
   * METODO PARA ENCONTRAR LOS DIFERENTES DISPOSITIVOS DE AUDIO Y VIDEO:
   * @param deviceInfos Información  de los dispositivos
   */
  private getDevices(deviceInfos: any) {
    let counter = 0;
    deviceInfos.forEach((device, index) => {
      if (device.kind === "videoinput") {
        this.setCamera(device, index);
      }
      counter++;
      if (counter == deviceInfos.length) {
        this.openSomeCamera();
      }
    });
  }

  /**
   * METODO PARA INICIAR LA CAPTURA DE LA CÁMARA:
   */
  private startLiveCamp(infoCamp: string) {
    if (this.startCamera != false) {
      this._navigator = <any>navigator;
      this._navigator.getUserMedia = (this._navigator.getUserMedia || this._navigator.webkitGetUserMedia || this._navigator.mozGetUserMedia || this._navigator.msGetUserMedia);

      this._navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: infoCamp } }
      }).then((stream) => {

        this.cameraReady.emit(true);
        this.localStream = stream;
        this._video.srcObject = stream;

        this.mediaStreamTrack = stream.getVideoTracks()[0];
        this.imageCapture = new ImageCapture(this.mediaStreamTrack, stream);
      }).catch(error => console.error('getUserMedia() error:', error));
    }
  }

  /**
   * METODO PARA INICIAR LA CAPTURA DE IMAGEN DE LA CÁMARA FRONTAL:
   */
  private startFrontLiveCam() {
    this.backCamera = false;
    this.stopStream();
    this.startLiveCamp('user');
  }

  /**
   * METODO PARA INICIAR LA CAPTURA DE IMAGEN DE LA CÁMARA TRASERA:
   */
  private startBackLiveCam() {
    if (this.swapCamera) {
      this.backCamera = true;
      this.stopStream();
      this.startLiveCamp('environment');
    }
    else {
      this.startFrontLiveCam();
    }
  }

  /**
   * METODO PARA DETENER LA CAPTURA DE IMAGEN DE LA CÁMARA:
   */
  private stopStream() {
    if (this.localStream !== undefined) {
      const tracks = this.localStream.getTracks();
      tracks.forEach((tracks) => {
        tracks.stop();
      });
    }
  }

  /**
   * METODO PARA OBTENER UNA CAPTURA DE IMAGEN (SNAP SHOT) DEL STREAM
   */
  private takeSnapShot() {
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
                type: MEDIA_TYPES.image,
                mediaFile: fixedBlob,
                removeable: true,
                active: true,
                hidden: false
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
   * METODO PARA INCIAR LA CONEXIÓN AL SOCKET DE KURENTO CLIENT:
   */
  private connectToStreamingClient() {
    this.initVariables();
    return this._webrtcSocketService.connecToKurento(this.pubId, this._video);
  }

  private startTransmission() {
    if (this.pubId && !this.streamOwnerId && !this.transmissionOn) {
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
   * METODO PARA UNIRSE A UNA TRANSMISIÓN
   */
  private joinTransmission() {
    this.connectToStreamingClient()
      .then((response: boolean) => {
        if (response) {
          this._webrtcSocketService.startViewer(this.streamOwnerId);
        }
      })
      .catch((response: boolean) => {
        console.log("[WERTC-CAMERA COMPONENT]: NO SE HA PODIDO CONECTAR A LA TRANSMISIÓN, FALLO EN LA CONEXIÓN");
      });
  }

  /******************************** METHODS FOR RECORDING PROCESS ***********************/
  /***
   * Proceso de inicio de grabacion.
   */
  private startRecorder() {
    let idCamera = this.backCamera ? this._backCamera.id : this._frontCamera.id;
    let constraints = {
      audio: true,
      video: {
        deviceId: idCamera
      }
    }

    try {
      console.log("proceso de grabacion", constraints);
      navigator.getUserMedia(constraints, (stream) => {
        this.onMediaSuccess(stream);
      }, (err) => {
        this.onMediaError(err);
      });
    } catch (err) {
      console.error("Error al procesar el videp", err);
    }
  }

  /***
   * Metodo para recibir el blob de datos.
   * @param stream {datos de grabacion de video}
   */
  private onMediaSuccess(stream) {

    if (this.maxSnapShots >= 1) {

      this.mediaRecorder = new mediaStreamRecorder(stream);
      this.mediaRecorder.mimeType = 'video/webm\?codecs=vp9';
      this.mediaRecorder.stream = stream;
      this.mediaRecorder.ondataavailable = (blob) => {

        //Crea ruta temporal
        var blobURL = URL.createObjectURL(blob);

        //datos de video
        this.videoRecorder = {
          mediaFileUrl: blobURL,
          type: MEDIA_TYPES.video,
          mediaFile: blob,
          removeable: true,
          active: true,
          hidden: false
        }

        //Notifica eventos de finalizacion de grabacion
        this.notifiStopRecorder();
      }

      //cantidad de capturas por segundo
      this.mediaRecorder.start(10);

    }else{
      
      this.stopStream();
      this.closeEmitter.emit(true);
    }
  }

  /**
   * Ejecuta acciones una vez finalizado la grabacion. 
   */
  private notifiStopRecorder() {

    this._cameraService.notifySnapShot(this.videoRecorder);

    //Cierra el modal
    this.closeEmitter.emit(true);

    console.log("Orden de cerrar.... desde webrtc camera component");
    //Notifica que se cierre el progress bar.
    this.notifyAction({ method: 'close' });

    Snackbar.show({ text: "Video grabado exitosamente", pos: 'bottom-center', actionText: 'Listo', actionTextColor: '#34b4db', customClass: "p-snackbar-layout" });
  }

  /**
   * Notifica alguna accion 
   */
  private notifyAction(contentData: any) {
    this._dynaContentService.executeAccion({ contentType: CONTENT_TYPES.progress_bar, contentData: contentData });
  }

  /**
   * Pausar la grabacion
   */
  private pauseRecorder() {
    if (this.mediaRecorder) {
      this.initPauseVideo = true;
      this.mediaRecorder.pause();
    }
  }

  /**
   * Reanudar la grabacion
   */
  private resumeRecorder() {
    if (this.mediaRecorder) {
      this.initPauseVideo = false;
      this.mediaRecorder.resume();
    }
  }

  /**
   * Detiene la grabacion
   */
  private stopRecorder() {
    
    if (this.mediaRecorder) {

      if (this.initPauseVideo){
        this.mediaRecorder.resume();
      }
      
      //Abre el progress bar.
      this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.progress_bar, contentData: 20 });

      try {
        this.mediaRecorder.stream.getTracks().forEach((track) => {
          track.stop();
        });
        this.mediaRecorder.stop();
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  /**
   * Error al conseguir el blob de transmicion.
   * @param err 
   */
  private onMediaError(err: any) {
    this.handleError(err);
  }

  /**
   * METODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      switch (property) {
        case 'pubId':
          if (changes[property].currentValue) {
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

    this._cameraService.notifySnapShot(null);
  }

  /**
   * Error al obtener los dispositivos del dispositivo(smartphone o PC)
   * @param error
   */
  handleError(error) {
    console.log(error);
  }

}