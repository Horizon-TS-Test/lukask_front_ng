import { Injectable } from '@angular/core';
import * as kurentoUtils from 'kurento-utils';
import { REST_SERV } from '../rest-url/rest-servers';

@Injectable({
  providedIn: 'root'
})
export class WebrtcSocketService {
  public kurentoWs : any;
  public video: any;
  private webRtcPeer:any;
  private _videoData:any;
  constructor() { 
  }

  connecToKurento(){
    
    this._videoData = document.querySelector("#video");
    this.kurentoWs  = new WebSocket(REST_SERV.webRtcSocketServerUrl);
    console.log("this.video", this._videoData)

    this.kurentoWs.onmessage = (message) =>{ 
      
      var parsedMessage = JSON.parse(message.data);
      console.log("parsedMessage.keyWord", parsedMessage.keyWord)
      switch(parsedMessage.keyWord){
        case 'presenterResponse':
          this.presenterResponse(parsedMessage);
          break;
        
        case 'viewerResponse':
          this.viewerResponse(parsedMessage);
          break;
        
        case 'stopCommunication':
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
  presenter(){
    console.log("presenter video")
    if(!this.webRtcPeer){
      let options = {
        localVideo : this._videoData,
        onicecandidate : (candidate) =>{this.onIceCandidate(candidate)} 
      }
      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, (error) =>{
          
        if(error) {
            console.log(error);
        }
        this.webRtcPeer.generateOffer((error, offerSdp) => {this.onOfferPresenter(error, offerSdp)});
      });
    }
  }

  /**
   * Oferta del presentador del video.
   */
  onOfferPresenter(error, offerSdp){
    
    if(error) {
        console.log("error al ofertar", error)
    }
    let message = {
      keyWord : 'presenter',
      sdpOffer : offerSdp
    };
    this.sendMessage(message);
  }

  /**
   * Presenta informacion, de candidato a la transmicion
   * @param candidate 
   */
  onIceCandidate(candidate){

    console.log('candidato local' + JSON.stringify(candidate));
    let message = {
      keyWord : 'onIceCandidate',
      candidate : candidate
    }
    this.sendMessage(message);
  }

  /**
   * Envia datos de infromacion al servidor.
   */
  sendMessage(message){

    var jsonMessage  = JSON.stringify(message);
    console.log("enviando mensaje", jsonMessage);
    this.kurentoWs.send(jsonMessage);
  }

  /**
   * Proceso de presentaacio de video para los clientes(viewer)
   */
  startViewer(){
    if(!this.webRtcPeer){

      let options = {
        remoteVideo: this._videoData,
        onicecandidate : (candidate) =>{ this.onIceCandidate(candidate)}
      }

      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, (error)  =>{
          if(error) {
            console.log("error", error);
          }
          this.webRtcPeer.generateOffer((error, offerSdp) => {this.onOfferViewer(error, offerSdp)})
      });
    }
  }

  /**
   * Procesa la oferta del cliente
   * @param error 
   * @param offerSdp 
   */
  onOfferViewer(error, offerSdp){
    if(error){
      console.log(error);
      return error;
    }
    
    let message = {
      keyWord : 'viewer',
      sdpOffer : offerSdp
    }
    this.sendMessage(message)
  }

  /**
   * Procese a detener la transmicion del presenter.
   */
  stop(){
    if(this.webRtcPeer){
      var messege = {
        keyWord : 'stop'
      }

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
  presenterResponse(message){
    console.log("Respuesta desde middleware", message.sdpAnswer)
    if(message.response != 'accepted'){
      var errorMsg =  message.message ? message.message : 'Unknow error';
      console.warn('Call not accepted for the following reason: ' + errorMsg);
      this.dispose();
    }else{
      this.webRtcPeer.processAnswer(message.sdpAnswer);
    }
  }

  viewerResponse(message){
    console.log("respuesta desde servidor midd", message)
      if(message.response != 'accepted'){
        let errorMsg = message.message ? message.message : 'Unknow error';
        console.warn('Call not accepted for the following reason: ' + errorMsg);
        this.dispose();
      } else {
        this.webRtcPeer.processAnswer(message.sdpAnswer);
      }
  }

  dispose(){
    if(this.webRtcPeer){
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
    }
  }
}
