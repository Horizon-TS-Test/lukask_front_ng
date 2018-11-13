import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Publication } from 'src/app/models/publications';
import { QuejaService } from 'src/app/services/queja.service';
import { OwnPubsService } from 'src/app/services/own-pubs.service';
import { ASSETS } from 'src/app/config/assets-url';
import { DynaContent } from 'src/app/interfaces/dyna-content.interface';

@Component({
  selector: 'ownpub-container',
  templateUrl: './ownpub-container.component.html',
  styleUrls: ['./ownpub-container.component.css']
})
export class OwnpubContainerComponent implements OnInit {
  @Output() geoMap = new EventEmitter<DynaContent>();

  private myPubList: Publication[];
  private ownPubsDiv: any;
  private activeClass: string;
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  public preloader: string;

  constructor(
    private _quejaService: QuejaService,
    private _ownPubsService: OwnPubsService
  ) {
    this.preloader = ASSETS.preloader;
    this._ownPubsService.moreOwnPubsRequest$.subscribe((more: boolean) => {
      if (more && this.activeClass != this.LOADER_ON) {
        let ownClassList = this.ownPubsDiv.classList;
        this.activeClass = this.LOADER_ON;
        if (ownClassList) {
          ownClassList.remove(this.LOADER_HIDE);
          ownClassList.add(this.LOADER_ON);
        }

        this.getMyPubList(true);
      }
    });
  }

  ngOnInit() {
    this.ownPubsDiv = document.querySelector("#ownPubs");

    setTimeout(() => {
      this.getMyPubList();
    }, 4000);
  }

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES DEL USUARIO LOGGEADO, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  private getMyPubList(more: boolean = false) {
    if (more) {
      this._quejaService.getMorePubs(true).then((morePubs: Publication[]) => {
        let ownClassList = this.ownPubsDiv.classList;
        if (ownClassList) {
          setTimeout(() => {
            this.activeClass = "";
            ownClassList.remove(this.LOADER_ON);

            setTimeout(() => {
              this.activeClass = this.LOADER_HIDE;
              ownClassList.add(this.LOADER_HIDE);
            }, 800);
          }, 1000);
        }
        this.myPubList = morePubs;
        this._quejaService.loadOwnPubs(this.myPubList);
      });
    }
    else {
      this._quejaService.getPubList(true).then((pubs: Publication[]) => {
        this.myPubList = pubs;
        this._quejaService.loadOwnPubs(this.myPubList);
      });
    }
  }

  /**
   * METODO PARA MOSTRAR LA QUEJA EN EL MAPA DADO EL VALO DEL EVENT EMITTER DEL COMPONENTE HIJO:
   * @param $event 
   */
  public geolocatePub(event: DynaContent) {
    this.geoMap.emit(event);
  }
}
