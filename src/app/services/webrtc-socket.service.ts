import { Injectable } from '@angular/core';
import * as kurentoUtils from 'kurento-utils';
import { REST_SERV } from '../rest-url/rest-servers';
import { QuejaService } from './queja.service';

@Injectable({
  providedIn: 'root'
})

//HREF ABOUT WEBSOCKET: https://developer.mozilla.org/es/docs/Web/API/WebSocket
export class WebrtcSocketService {
  private webRtcPeer: any;
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
    }
  }

  /**
   * Oferta del presentador del video.
   */
  onOfferPresenter(error, offerSdp) {

    if (error) {
      console.log("error al ofertar", error)
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
      this.dispose();
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
}
