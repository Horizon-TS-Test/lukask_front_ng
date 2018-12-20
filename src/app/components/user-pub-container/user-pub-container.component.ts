import { Component, OnInit, EventEmitter, Output, OnDestroy, Input } from '@angular/core';
import { Publication } from 'src/app/models/publications';
import { ASSETS } from 'src/app/config/assets-url';
import { DynaContent } from 'src/app/interfaces/dyna-content.interface';
import { UserPubsService } from 'src/app/services/user-pubs.service';
import { Subscription } from 'rxjs';
import { QuejaService } from 'src/app/services/queja.service';
import { PUB_TYPES } from 'src/app/config/pub-types';

@Component({
  selector: 'user-pub-container',
  templateUrl: './user-pub-container.component.html',
  styleUrls: ['./user-pub-container.component.css']
})
export class UserPubContainerComponent implements OnInit, OnDestroy {
  @Input() isAdmin: boolean;
  @Output() geoMap = new EventEmitter<DynaContent>();

  private morePubsSubscriber: Subscription;
  private pubUpdateSub: Subscription;
  private offPubSub: Subscription;
  private userPubList: Publication[];
  private userPubsDiv: any;
  private activeClass: string;
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";
  private pagePattern: string;

  public preloader: string;

  constructor(
    private _userPubsService: UserPubsService,
    private _quejaService: QuejaService
  ) {
    this.preloader = ASSETS.preloader;
  }

  ngOnInit() {
    this.userPubsDiv = document.querySelector("#userPubs");

    setTimeout(() => {
      if (this.isAdmin == true) {
        this.getUserPubList();
        console.log("Es admin");
      }
      else if (this.isAdmin == false) {
        this.getMyPubList();
        console.log("No es admin");
      }
    }, 1500);

    this.listenToMorePubs();
    this.listenToUserPubUpdate();
    this.listenToOffUserPub();
  }

  /**
   * METODO PARA ESCUCHAR LA PETICION DE MAS UER PUBS:
   */
  private listenToMorePubs() {
    this.morePubsSubscriber = this._userPubsService.moreUserPubsRequest$.subscribe((more: boolean) => {
      if (more && this.activeClass != this.LOADER_ON) {
        let ownClassList = this.userPubsDiv.classList;
        this.activeClass = this.LOADER_ON;
        if (ownClassList) {
          ownClassList.remove(this.LOADER_HIDE);
          ownClassList.add(this.LOADER_ON);
        }

        if (this.isAdmin == true) {
          this.getUserPubList(true);
        }
        else if (this.isAdmin == false) {
          this.getMyPubList(true);
        }
      }
    });
  }

  /**
   * METODO PARA TERMINAR LA ANIMACION DE CARGA DE MAS PUBLICACIONES
   */
  private animationEnd() {
    let ownClassList = this.userPubsDiv.classList;
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
  }

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES DEL USUARIO LOGGEADO, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  private getMyPubList(more: boolean = false) {
    if (more) {
      this._userPubsService.getMoreUserPubs(this.pagePattern, this.userPubList, false).then((userPubData: { userPubs: Publication[], pagePattern: string }) => {
        this.animationEnd();
        this.pagePattern = userPubData.pagePattern;
        this.userPubList = userPubData.userPubs;
        this._userPubsService.loadUserPubs(this.userPubList);
      });
    }
    else {
      this._userPubsService.getUserPubList(false).then((userPubData: { userPubs: Publication[], pagePattern: string }) => {
        this.pagePattern = userPubData.pagePattern;
        this.userPubList = userPubData.userPubs;
        this._userPubsService.loadUserPubs(this.userPubList);
      });
    }
  }

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES DEL USUARIO LOGGEADO, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  private getUserPubList(more: boolean = false) {
    if (more) {
      this._quejaService.getMorePubs(this.pagePattern, this.userPubList, false).then((userPubData: { userPubs: Publication[], pagePattern: string }) => {
        this.animationEnd();
        this.pagePattern = userPubData.pagePattern;
        this.userPubList = userPubData.userPubs;
        this._userPubsService.loadUserPubs(this.userPubList);
      });
    }
    else {
      this._quejaService.getPubList(false).then((userPubData: { userPubs: Publication[], pagePattern: string }) => {
        this.pagePattern = userPubData.pagePattern;
        this.userPubList = userPubData.userPubs;
        this._userPubsService.loadUserPubs(this.userPubList);
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

  /**
   * METODO PARA ESCUCHAR LOS CAMBIOS DE LAS PUBLICACIONES PROPIAS DEL USUARIO QUE VIENEN TRAVES DEL SOCKET.IO CLIENT:
   */
  private listenToUserPubUpdate() {
    this.pubUpdateSub = this._userPubsService.updatedUserPub$.subscribe((ownPubData: { userPubJson: any, action: string }) => {
      if (ownPubData && this.userPubList) {
        if (ownPubData.userPubJson.type_publication_detail == PUB_TYPES.claim) {
          this._userPubsService.updateUserPubList(ownPubData.userPubJson, ownPubData.action, this.userPubList);
          this._userPubsService.loadUserPubs(this.userPubList);
        }
      }
    });
  }

  /**
   * METODO PARA ESCUCHAR LOS CAMBIOS DE LAS PUBLICACIONES PROPIAS DEL USUARIO QUE SON INSERTADAS DE FORMA OFFLINE
   */
  private listenToOffUserPub() {
    this.offPubSub = this._userPubsService.newOffUserPub$.subscribe((offPub: Publication) => {
      if (offPub) {
        this.userPubList.splice(0, 0, offPub);
        this._userPubsService.loadUserPubs(this.userPubList);
      }
    });
  }

  /**
   * METODO PARA CANCELAR UN RECLAMO OFFLINE:
   * @param event 
   */
  public cancelPub(event: Publication) {
    this._userPubsService.deleteOfflineUserPub(event, this.userPubList);
    this._userPubsService.loadUserPubs(this.userPubList);
  }

  ngOnDestroy() {
    this._userPubsService.loadUserPubs(null);
    this.morePubsSubscriber.unsubscribe();
    this.offPubSub.unsubscribe();
    this.pubUpdateSub.unsubscribe();
  }
}
