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
      console.log("mesnaje desde mid ", parsedMessage);
      switch(parsedMessage.keyWord){
        case 'presenterResponse':
          this.presenterResponse(parsedMessage);
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
      console.log("options", options)
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

  dispose(){
    if(this.webRtcPeer){
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
    }
  }
}
