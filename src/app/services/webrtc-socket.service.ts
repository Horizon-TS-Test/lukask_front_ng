import { Injectable } from '@angular/core';
import * as kurentoUtils from 'kurento-utils';
import * as kurentoClientLibs from 'kurento-client';
import { REST_SERV } from '../rest-url/rest-servers';
import { QuejaService } from './queja.service';
import { SERV_IP } from "../servers/servers";
declare var MediaRecorder:any;

@Injectable({
  providedIn: 'root'
})

//HREF ABOUT WEBSOCKET: https://developer.mozilla.org/es/docs/Web/API/WebSocket
export class WebrtcSocketService {
  private webRtcPeer: any;
  /*private webRtc:any;
  private recordRtc:any;
  private pipeline:any;*/
  private stream:any;
  private recordedBlobs:any[];
  private mediaRecorder:any;
  private _videoData: any;
  private userId: any;
  private pubId: any;
  private isPresenter: any;
  public kurentoWs: any;
  public video: any;

  constructor(
    private _quejaService: QuejaService
  ) {
    this.isPresenter = false;
    this.recordedBlobs  = [];
  }

  /**
   * MÉTODO PARA CONECTAR AL WEBSOCKET DE KURENTO CLIENT DEL MIDDLEWARE:
   * @param idUser 
   * @param _video 
   */
  connecToKurento(idUser: string, pubId: string, _video: any) {
    let websocketPromise = new Promise((resolve, reject) => {
      this.kurentoWs = new WebSocket(REST_SERV.webRtcSocketServerUrl);

      this.kurentoWs.onopen = (open) => {
        console.log("idUser", idUser);
        console.log("pubId", pubId);
        this.userId = idUser;
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
  messageFromKurento() {
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
          console.log("se cerro la transmición...")
          this.dispose();
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
  presenter(backCamera, frontCamera) {
    let idCamera = backCamera.id == "" ? frontCamera.id : backCamera.id;
    let constraints = {
      audio: true,
      video: {
        deviceId: { exact: idCamera }
      }
    }

    if (!this.webRtcPeer) {
      let options = {
        localVideo: this._videoData,
        mediaConstraints: constraints,
        onicecandidate: (candidate) => { this.onIceCandidate(candidate) }
      }
      console.log("options....", options);
      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, (error) => {

        if (error) {
          console.log(error);
        }
        this.webRtcPeer.generateOffer((error, offerSdp) => { this.onOfferPresenter(error, offerSdp) });

        this.isPresenter = true;
      });

      //Proceso de incio de grabación.
      this.dataRecord(constraints);

      //Proceso de grabación.
      this.startRecording();

    }
  }

  /**
   * Oferta del presentador del video.
   */
  onOfferPresenter(error, offerSdp) {

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

    /*kurentoClientLibs(SERV_IP.kurentoServer, (error, client) =>{
      if(error){
        console.log("Error al conectar", error);
        return error;
      }

      client.create('MediaPipeline', (error, pipeline) =>{
        if(error){
          console.log("Error al crear el pipeline", error);
          return error;
        }
        
        let elements = [
          {type: 'RecorderEndPoint', params : {uri : SERV_IP.fileRepository}},
          {type: 'WebRtcEndpoint', params: {}}
        ];

        this.pipeline = pipeline;
        this.pipeline.create(elements, (error, elements) => {
          if(error){
            console.log("error al crear el pipeline", error);
            return error;
          }

          this.recordRtc = elements[0];
          this.webRtc   = elements[1];
          //this.setIceCandidateCallbacks();

          this.webRtc.processOffer(offerSdp, (error, answer) =>{
            if(error){
              console.log("error al procesar la oferta", error);
              return error;
            }
            this.webRtcPeer.processAnswer(answer);
          });

          client.connect(this.webRtc, this.recordRtc, (error) =>{
            if(error){
              console.log("error al conectar al recorder", error);
              return error;
            }

            this.recordRtc.record((error) =>{
              if(error) {
                console.log("Error en el proceso de grabacion", error);
                return error;
              }
            });
          });
        });
      });
    }); */
  }

  /**
   * Presenta informacion, de candidato a la transmicion
   * @param candidate 
   */
  onIceCandidate(candidate) {

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
  sendMessage(message) {

    var jsonMessage = JSON.stringify(message);
    console.log("enviando mensaje", this.kurentoWs);
    this.kurentoWs.send(jsonMessage);
  }

  /**
   * Proceso de presentaacio de video para los clientes(viewer)
   */
  startViewer(ownerId: string) {
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
  onOfferViewer(error: any, offerSdp: any, ownerId: string) {
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
  closeTransmissionCnn() {
    if (this.webRtcPeer) {
      var messege = {
        keyWord: 'stop',
        idUser: this.userId
      }
      console.log("messege", messege);
      this.sendMessage(messege);
      //this.recordRtc.stop();
      //this.pipeline.release();
      this.dispose();

      //Detener la transmición.
      this.stopRecorder();
    }
  }

  /***********************************
  * Respuestas desde el servidor node 
  ************************************/

  /**
   * respuesta del presenter 
   */
  presenterResponse(message) {
    console.log("Respuesta desde middleware", message.sdpAnswer)
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      console.warn('Call not accepted for the following reason: ' + errorMsg);
      this.dispose();
    } else {
      this.webRtcPeer.processAnswer(message.sdpAnswer);
    }
  }

  /**
   * Respuesta de las clientes conectados a la transmicion
   */
  viewerResponse(message) {
    console.log("respuesta desde servidor midd", message)
    if (message.response != 'accepted') {
      let errorMsg = message.message ? message.message : 'Unknow error';
      console.warn('Call not accepted for the following reason: ' + errorMsg);
      this.dispose();
    } else {
      this.webRtcPeer.processAnswer(message.sdpAnswer);
    }
  }

  /**
   * Liberamos el WebRtcPeer
   */
  dispose() {
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
      this.closeWebSocketConn();
    }
  }

  private closeWebSocketConn() {
    this.kurentoWs.close();
  }

  /*setIceCandidateCallbacks(){
    this.webRtcPeer.on('icecandidate', (candidate) =>{
      console.log("Local candidate:",candidate);
      candidate = kurentoClientLibs.getComplexType('IceCandidate')(candidate);
      webRtcEp.addIceCandidate(candidate, onerror);
    });

    webRtcEp.on('OnIceCandidate', (event) => {
      var candidate = event.candidate;
      console.log("Remote candidate:",candidate);
      webRtcPeer.addIceCandidate(candidate, onerror);
    });
  }*/


  dataRecord(constraints){
    try{
      this.stream = navigator.mediaDevices.getUserMedia(constraints);
    } catch(e){
      console.log('navigator.getUserMedia error', e);
    }
  }
  
  /**
   * Inicio del proceso de grabación.
   */
  startRecording(){
    
    this.recordedBlobs = [];

    //Opciones de datos.
    let options = {
      mimeType : 'video/webm;codecs=vp9'
    }

    //Proceso de validacion de soporte de codec's para el navegador.
    if(!MediaRecorder.isTypeSupported(options.mimeType)){
      
      console.error(`${options.mimeType} no es soportado`);
      options = { mimeType : 'video/webm;codecs=vp8'};
      if(!MediaRecorder.isTypeSupported(options.mimeType)){
        
        console.error(`${options.mimeType} no es soportado`);
        if(!MediaRecorder.isTypeSupported(options.mimeType)){
          
          console.log(`${options.mimeType} no es soportado`);
          options = {mimeType : ''};
        }
      }
    }

    //Objeto que contiene la grabación.
    try{
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    }catch(error){
      console.error('Error en el proceso de grabación:', error);
      return error;
    }
    console.info('Proceso de grabacion exitoso', this.mediaRecorder, ' Con opciones de grabación:', options);
    
    //Escuchamos el evento de detenido de la grabación
    this.mediaRecorder.onstop = (event) =>{
      console.info("La grabación de ha detenido", event);
    }

    //proceso de almacenamiento de blob´s de la transmición
    this.mediaRecorder.ondataavailable = this.handleDataAvailable;

    //Escuchamos el evento de inicio de la grabación.
    this.mediaRecorder.start(10);

    console.info('Media recorder iniciado', this.mediaRecorder);
  }

  /**
   * Proceso de alamacenamiento de blod del video
   * @param event 
   */
  handleDataAvailable(event){
    if(event.data && event.data.size > 0){
      this.recordedBlobs.push(event.data);
    }
  }

  stopRecorder(){
    this.mediaRecorder.stop();
    console.log('Recorder Blobs:', this.recordedBlobs);
    let bufferContainer = new Blob(this.recordedBlobs, {type: 'video/webm'});
    console.log("cadena de video: ", bufferContainer);
    let urlDataVideo = window.URL.createObjectURL(bufferContainer);
    console.log("URL para descarga devideo", urlDataVideo);
  }


}

