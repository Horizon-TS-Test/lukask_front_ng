import { Injectable } from '@angular/core';
import { MEDIA_TYPES } from '../config/media-types';

declare var Camera: any;
declare var navigator: {
  camera: any,
  device: any
};
declare var window: {
  resolveLocalFileSystemURL: any
};

@Injectable({
  providedIn: 'root'
})
export class CordovaCameraService {

  constructor() { }

  /**
   * MÉTODO PARA ESTABLECER LAS OPCIONES DE LA CÁMARA ANTES DE TOMAR UNA FOTOGRAFÍA:
   * @param srcType 
   */
  private setOptions(srcType) {
    var options = {
      // Some common settings are 20, 50, and 100
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      // In this app, dynamically set the picture source, Camera or photo gallery
      sourceType: srcType,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: false,
      correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
  }

  /**
   * METODO PARA ABRIR LA CAMARA PARA POSTERIORMENTE TOMAR UNA FOTOGRAFIA:
   */
  public openCamera(callback) {
    var srcType = Camera.PictureSourceType.CAMERA;
    var options = this.setOptions(srcType);

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

      callback(imageUri);
    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");
      callback(null);
    }, options);
  }

  /**
   * Proceso para abrir camara y realizar el proceso de grabacion
   * @param callback {abrir camara para proceso de grabacion de video}
   */
  public openCameraVideo(callback){

    console.log("abriendo camara..");
    let options = { limit: 1, duration: 120 };
    let path:any;
    navigator.device.capture.captureVideo((mediaFiles) =>{
      mediaFiles.forEach((element) => {
        //path.push(element);
        console.log("ruta de grabacion....", element);
        path=element;
      });
      callback(path);
    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");
      callback(null);
    }, options);
  }

  
  /**
   * PENDIENTE!!!!!
   */
  public openFilePicker() {
    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = this.setOptions(srcType);

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

      alert("GETTING IMG: " + imageUri);

    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");
      return null;
    }, options);
  }

  /**
   * MÉTODO PARA OBTENER EL OBJETO BLOB DE UNA IMAGEN CAPTURADA 
   * DESDE LA CÁMARA O DESDE EL DIRECTORIO DEL DISPOSITIVO
   * @param imgUri URL DEL RECURSO CAPTURADO POR CAMARA O DESDE EL DIRECTORIO DEL DISPOSITIVO
   * @param callback 
   */
  public getFileBlob(imgUri, action, callback) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

      fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function (e) {

          //definimos el tipo de blob a extraer.
          var type = action == MEDIA_TYPES.video ? 'video/webm' : file.type; 
          console.log("type..", type);
          var imgBlob = new Blob([this.result], { type: type });
          callback(imgBlob);
        };
        reader.readAsArrayBuffer(file);

      }, function (e) {
        callback(null);
      });

    }, function () {
      // If don't get the FileEntry (which may happen when testing
      // on some emulators), copy to a new FileEntry.
    });
  }

  /**
   * METODO PARA VERIFICAR SI EL APP ES MOVIL NATIVA O WEB PROGRESIVA:
   */
  public isCameraEnabled() {
    return navigator.camera != undefined;
  }
}
