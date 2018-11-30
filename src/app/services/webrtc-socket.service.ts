import { Injectable, NgZone } from '@angular/core';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { Headers, Http, Response } from '@angular/http';

import { REST_SERV } from '../rest-url/rest-servers';
import { QuejaService } from './queja.service';
import * as kurentoUtils from 'kurento-utils';
import * as crypto from '../tools/crypto-gen';
import * as mediaStreamRecorder from 'msr';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})

//HREF ABOUT WEBSOCKET: https://developer.mozilla.org/es/docs/Web/API/WebSocket
export class WebrtcSocketService {
  private webRtcPeer: any;
  private recordedBlobs: any[];
  private mediaRecorder: any;
  private _videoData: any;
  private userId: string;
  private pubId: string;
  private isPresenter: any;

  private endStreamingSub = new BehaviorSubject<boolean>(null);
  endStreaming$: Observable<boolean> = this.endStreamingSub.asObservable();

  public kurentoWs: any;
  public video: any;

  constructor(
    private _quejaService: QuejaService,
    private _userService: UserService,
    private _http: Http,
    private _ngZone:NgZone
  ) {

    this.userId = _userService.getUserProfile().id;
    this.isPresenter = false;
    this.recordedBlobs = [];
    console.log("this.recordedBlobs ", this.recordedBlobs);
  }

  public notifyEndStream(end: boolean) {
    this.endStreamingSub.next(end);
  }

  /**
   * MÉTODO PARA CONECTAR AL WEBSOCKET DE KURENTO CLIENT DEL MIDDLEWARE:
   * @param idUser 
   * @param _video 
   */
  public connecToKurento(pubId: string, _video: any) {
    
    let websocketPromise = new Promise((resolve, reject) => {
      this.kurentoWs = new WebSocket(REST_SERV.webRtcSocketServerUrl);
      this.kurentoWs.onopen = (open) => {
        this.pubId = pubId;
        this._videoData = _video;
        this.messageFromKurento();
        console.log("[WEBRTC-SOCKET SERVICE]: CONEXIÓN EXITOSA AL WEBSOCKET DE KURENTO CLIENT", open);
        resolve(true);
      }
      this.kurentoWs.onerror = (error) => {
        this.kurentoWs = null;
        console.log("[WEBRTC-SOCKET SERVICE]: CONEXIÓN FALLIDA AL WEBSOCKET DE KURENTO CLIENT", error);
        reject(false);
      }
      this.kurentoWs.onclose = (close) => {
        this.kurentoWs = null;
        console.log("[WEBRTC-SOCKET SERVICE]: CONEXIÓN CERRADA AL WEBSOCKET DE KURENTO CLIENT", close);
        this.break();
        if (this.isPresenter) {
          this._quejaService.updateTransmission(this.pubId, true);
        }
      }
    });

    return websocketPromise;
  }

  /**
   * MÉTODO PARA RECIBIR LAS RESPUESTAS DEL SERVIDOR MIDDLEWARE DONDE SE EJECUTA EL KURENTO CLIENT:
   */
  private messageFromKurento() {
    this.kurentoWs.onmessage = (message) => {
      var parsedMessage = JSON.parse(message.data);
      console.log("parsedMessage.keyWord", parsedMessage.keyWord);
      switch (parsedMessage.keyWord) {
        case 'presenterResponse':
          this.presenterResponse(parsedMessage);
          break;

        case 'viewerResponse':
          this.viewerResponse(parsedMessage);
          break;

        case 'stopCommunication':
          this.break();
          this.notifyEndStream(true);
          break;

        case 'iceCandidate':
          this.webRtcPeer.addIceCandidate(parsedMessage.candidate);
          break;
      }
    };
  }

  /**
   * Proceso para presentar informacion del video.
   */
  public presenter(backCamera, frontCamera) {
    let idCamera = backCamera.id == "" ? frontCamera.id : backCamera.id;
    let constraints = {
      audio: true,
      video: {
        //width : 1280,
        //height : 720,
        deviceId: { exact: idCamera }
      }
    }

    if (!this.webRtcPeer) {
      
      this._ngZone.runOutsideAngular(() => {
        let options = {
          localVideo: this._videoData,
          mediaConstraints: constraints,
          onicecandidate: (candidate) => { this.onIceCandidate(candidate) }
        }

        this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, (error) => {

          if (error) {
            console.log(error);
          }
          this.webRtcPeer.generateOffer((error, offerSdp) => { this.onOfferPresenter(error, offerSdp) });

          this.isPresenter = true;
        });
      });

      //Proceso de incio de grabación.
      this._ngZone.runOutsideAngular(() => {
        this.dataRecord(constraints); 
      });
    }
  }

  /**
   * Oferta del presentador del video.
   */
  private onOfferPresenter(error, offerSdp) {
    
    if (error) {
      console.log("error al ofertar", error)
      return error;
    }

    let message = {
      keyWord: 'presenter',
      sdpOffer: offerSdp,
      userId: this.userId
    };
    this.sendMessage(message);

  }

  /**
   * Presenta informacion, de candidato a la transmicion
   * @param candidate 
   */
  private onIceCandidate(candidate) {

    console.log('candidato local' + JSON.stringify(candidate));
    let message = {
      keyWord: 'onIceCandidate',
      candidate: candidate,
      userId: this.userId
    }
    this.sendMessage(message);
  }

  /**
   * Envia datos de informacion al servidor.
   */
  private sendMessage(message) {

    var jsonMessage = JSON.stringify(message);
    this.kurentoWs.send(jsonMessage);
  }

  /**
   * Proceso de presentaacio de video para los clientes(viewer)
   */
  public startViewer(ownerId: string) {
    if (!this.webRtcPeer) {

      let options = {
        remoteVideo: this._videoData,
        onicecandidate: (candidate) => { this.onIceCandidate(candidate) }
      }

      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, (error) => {
        if (error) {
          console.log("error", error);
        }
        this.webRtcPeer.generateOffer((error, offerSdp) => { this.onOfferViewer(error, offerSdp, ownerId) })
      });
    }
  }

  /**
   * Procesa la oferta del cliente
   * @param error 
   * @param offerSdp 
   * @param ownerId ID DEL USUARIO DUEÑO DE LA TRANSMISIÓN:
   */
  private onOfferViewer(error: any, offerSdp: any, ownerId: string) {
    if (error) {
      console.log(error);
      return error;
    }

    let message = {
      keyWord: 'viewer',
      sdpOffer: offerSdp,
      idOwnerTrans: ownerId,
      idUser: this.userId
    }
    this.sendMessage(message)
  }

  /**
   * Procese a detener la transmicion del presenter.
   */
  public closeTransmissionCnn() {

      if (this.webRtcPeer) {
        var messege = {
          keyWord: 'stop',
          idUser: this.userId
        }
        this.sendMessage(messege);
        
        //Detener la transmición.
        this.break();
        
        //Detiene la transmicion
        this.stopRecorder();
      }
  }

  /***********************************
  * Respuestas desde el servidor node 
  ************************************/

  /**
   * respuesta del presenter 
   */
  private presenterResponse(message) {
    console.log("Respuesta desde middleware", message.sdpAnswer)
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      console.warn('Call not accepted for the following reason: ' + errorMsg);
      this.break();
    } else {
      this.webRtcPeer.processAnswer(message.sdpAnswer);
    }
  }

  /**
   * Respuesta de las clientes conectados a la transmicion
   */
  private viewerResponse(message) {
    console.log("respuesta desde servidor midd", message)
    if (message.response != 'accepted') {
      let errorMsg = message.message ? message.message : 'Unknow error';
      console.warn('Call not accepted for the following reason: ' + errorMsg);
      this.break();
    } else {
      this.webRtcPeer.processAnswer(message.sdpAnswer);
    }
  }

  /**
   * Liberamos el WebRtcPeer
   */
  private break() {
    if (this.webRtcPeer) {
      var res = this.webRtcPeer.dispose();
      this.webRtcPeer = null;
      this.closeWebSocketConn();
    }
  }


/***********************************************
 ** Proceso de grabación del video en memoria ** 
 ***********************************************/

/**
 * Proceso para obtener datos para la grabación
 * @param constraints 
 */
 private dataRecord(constraints){
    try{
      console.log("proceso de grabacion", constraints);
      navigator.getUserMedia(constraints, (stream) =>{
        this.onMediaSuccess(stream);
      }, (err) => {
        this.onMediaError(err);
      });
    }catch(err){
      console.error("Error al procesar el videp", err);
    }
  }

  /**
   * Proceso de grabacion exitoso
   * @param stream 
   */
  private onMediaSuccess(stream){

    this.mediaRecorder =  new mediaStreamRecorder(stream);
    this.mediaRecorder.mimeType = 'video/webm\;codecs=vp9';
    this.mediaRecorder.stream = stream;
    this.mediaRecorder.ondataavailable =  async (blob) =>{
      console.log("grabando..", blob);
      await this.recordedBlobs.push(blob);
      
      //Proceso para convertir 
      this.bufferToDataUrl((dataUrl, blob) => {
        //console.log("blob unificada..", blob);
        this.sendFilebKMS(blob);
      });
    }
    
    this.mediaRecorder.start(10);
  }

  /**
   * Error en procesamiento de video.
   * @param err 
   */
  private onMediaError(err){
    console.error(err);
  }
  
  /**
   * Cerramos la coneccion del WS de kurento.
   */
  private closeWebSocketConn() {
    this.kurentoWs.close();
  }
  
  /**
   * Proceso para detener la grabación.
   */
  private stopRecorder() {

    if (this.mediaRecorder) {
      //Proceso para detener la grabación.
      try {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => {
          track.stop();
        });
      } catch (err) {
        console.log("error al detner la transmicion", err);
      }
    }
  }

  /**
   * Proceso para obtener url del buffer
   * @param callback 
   */
  private bufferToDataUrl(callback) {

    let blob = new Blob(this.recordedBlobs, {
      type: "video/webm"
    });

    let reader = new FileReader();
    reader.onload = () => {
      callback(reader.result, blob);
    };
    reader.readAsDataURL(blob);
  }

  /**
   * Proceso para generar cadena de caracteres.
   */
  private generateKeyWord() {
    //Diccionario
    var letters = new Array('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
      'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4',
      '5', '6', '7', '8', '9', '0');
    var keyWord = ''
    for (var i = 0; i < 10; i++) {
      keyWord += letters[Math.floor(Math.random() * letters.length)];
    }
    return keyWord;
  }

  /**
  * Metodo para obtener flujo de video
  * @param url url del archivo a colsultar
  */
  public getvideoForUrl(url: string) {
    const mediaHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserKey()
    });
    return this._http.get(REST_SERV.mediaRecorder + "/?pathmedia=" + url, { headers: mediaHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        return response;
      }).catch((error: Response) => {
        return throwError(error.json());
      });
  }

  /**
   * Metodo para guardar el archivo de video generado en la transmicion
   * @param fileVideoRecorder datos del archivo de video
   */
  private sendFilebKMS(fileVideoRecorder: any) {
    let formData = new FormData();
    formData.append('idPublication', this.pubId);
    formData.append('media_file', fileVideoRecorder, crypto.CrytoGen.encrypt(this.generateKeyWord()) + Date.now());
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 201) {
          console.log(JSON.parse(xhr.response).data);
        } else {
          if (xhr.status == 0) {
            console.error(xhr.response);
          }
          else {
            console.error(JSON.parse(xhr.response));
          }
        }
      }
    };
    xhr.open("POST", REST_SERV.mediaRecorder, true);
    xhr.setRequestHeader('X-Access-Token', this._userService.getUserKey());
    xhr.withCredentials = true;
    xhr.send(formData);
  }

  
  /**
   * Inicio del proceso de grabación.
   */
  /*private startRecording() {

    //Opciones de datos.
    this.recordedBlobs = [];
    let options = {
      mimeType: 'video/webm;codecs=vp9'
    }

    //Proceso de validacion de soporte de codec's para el navegador.
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {

      console.error(`${options.mimeType} no es soportado`);
      options = { mimeType: 'video/webm;codecs=vp8' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {

        console.error(`${options.mimeType} no es soportado`);
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {

          console.log(`${options.mimeType} no es soportado`);
          options = { mimeType: '' };
        }
      }
    }

    //Objeto que contiene la grabación.
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (error) {
      console.error('Error en el proceso de grabación:', error);
      return error;
    }
    console.info('Proceso de grabacion exitoso', this.mediaRecorder, ' Con opciones de grabación:', options);

    //Escuchamos el evento de detenido de la grabación
    this.mediaRecorder.onstop = (event) => {
      console.info("La grabación de ha detenido", event);
    }

    this._ngZone.runOutsideAngular(() =>{
      //proceso de almacenamiento de blob´s de la transmición
      this.mediaRecorder.ondataavailable = (event) => {
        this.handleDataAvailable(event);
      }   
      
      //Escuchamos el evento de inicio de la grabación.
      this.mediaRecorder.start(100);
    });
  } */

  /*private handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      console.log("blob---", event.data);
      this.recordedBlobs.push(event.data);
    }
  }*/

  /*private dataUrlToFile(dataUrl) {
    let binary = atob(dataUrl.split(',')[1]);
    let data = [];
    console.log("binary......", binary);
    for (let i = 0; i < binary.length; i++) {
      data.push(binary.charCodeAt(i));
    }
    return new File([new Uint8Array(data)], crypto.CrytoGen.encrypt(this.generateKeyWord()) + Date.now(), {
      type: 'video/webm'
    });
  }*/

  /*private dataTestRecorder(){
      // Download locally
      function download(blob) {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    
      const successCallback = (stream) => {
        // Set up the recorder
        let blobs = [];
        let recorder = new MediaRecorder(stream, {mimeType: 'video/webm; codecs=vp9'});
        recorder.ondataavailable = e => { if (e.data && e.data.size > 0) blobs.push(e.data)};
        recorder.onstop = (e) => download(new Blob(blobs, {type: 'video/webm'}));
    
        // Record for 10 seconds.
        setTimeout(()=> recorder.stop(), 10000);
    
        // Start recording.
        recorder.start(10); // collect 10ms chunks of data
      };
    
     /* const errorCallback = (err) => {
        // We don't have access to the API
        console.log(err)
      };
    
      navigator.getUserMedia({
        audio: false,
        video: {'mandatory': {'chromeMediaSource':'screen'}}
      }, successCallback, errorCallback);
  
  }*/
}

