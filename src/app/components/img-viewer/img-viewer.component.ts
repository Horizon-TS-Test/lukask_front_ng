import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Media } from '../../models/media';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { CONTENT_TYPES } from '../../config/content-type';
import { REST_SERV } from '../../rest-url/rest-servers';
import { WebrtcSocketService } from '../../services/webrtc-socket.service';
import { UserService } from '../../services/user.service';
import * as lodash from 'lodash';

@Component({
  selector: 'img-viewer',
  templateUrl: './img-viewer.component.html',
  styleUrls: ['./img-viewer.component.css']
})
export class ImgViewerComponent implements OnInit {
  @Input() media: Media;
  @Input() showClass: string;
  @Input() opView: number;
  @Output() closeModal: EventEmitter<boolean>;
  

  public _dynaContent: DynaContent;
  public carouselOptions: any;
  public materialBtn: HorizonButton[];
  public _contentType: any;
  private videoRecPub : any;

  
  constructor() {
    this.closeModal = new EventEmitter<boolean>();
    this._contentType = CONTENT_TYPES;
    this.materialBtn = [
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    this.initCarousel();
  }

  ngAfterViewInit(){
    this.videoRecPub = document.getElementById("videoPub");
    //if(this.opView === CONTENT_TYPES.view_video){
      let mediaVideo = lodash.find(this.media, function(obj){
        return obj.format  == 'VD';
      });
      this.getvideo(mediaVideo.url);
    //}
  }
  
  /**
   * METODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE FOTOS:
   */
  initCarousel() {
    this.carouselOptions = {
      items: 1, dots: true, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false,
    }
  }

  /**
   * METODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * Por: Dennys Moyón
   * METODO para obtener video de acuerdo a archivo provisto por el array de medios de la publicación
   */
  getvideo(videoUrl:string){
		  /*this._webRtcSocketService.getvideoForUrl(videoUrl, this._userService).then((response:any) =>{
        ///media/?pathmedia=medios_lukask/zY5ArIw=1541546702035.webm
        REST_SERV.mediaRecorder
        this.videoRecPub.src = response.url;
      }).catch((error) =>{
        console.error("Error al cargar el video ", error);
      });*/

      try{  
        let reqDataUrl = REST_SERV.mediaRecorder + "/?pathmedia=" + videoUrl;
        this.videoRecPub.src = reqDataUrl;
      }catch(error){
        console.error("Error al cargar el video ", error);
      }
	}
}
