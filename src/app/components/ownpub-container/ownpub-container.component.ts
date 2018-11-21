import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Publication } from 'src/app/models/publications';
import { OwnPubsService } from 'src/app/services/own-pubs.service';
import { ASSETS } from 'src/app/config/assets-url';
import { DynaContent } from 'src/app/interfaces/dyna-content.interface';
import { UserPubsService } from 'src/app/services/user-pubs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ownpub-container',
  templateUrl: './ownpub-container.component.html',
  styleUrls: ['./ownpub-container.component.css']
})
export class OwnpubContainerComponent implements OnInit, OnDestroy {
  @Output() geoMap = new EventEmitter<DynaContent>();

  private morePubsSubscriber: Subscription;
  private pubUpdateSub: Subscription;
  private offPubSub: Subscription;
  private myPubList: Publication[];
  private ownPubsDiv: any;
  private activeClass: string;
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";
  private pagePattern: string;

  public preloader: string;

  constructor(
    private _userPubsService: UserPubsService,
    private _ownPubsService: OwnPubsService
  ) {
    this.preloader = ASSETS.preloader;
  }

  ngOnInit() {
    this.ownPubsDiv = document.querySelector("#ownPubs");

    setTimeout(() => {
      this.getMyPubList();
    }, 1500);

    this.listenToMorePubs();
    this.listenToOwnPubUpdate();
    this.listenToOffUserPub();
  }

  /**
   * METODO PARA ESCUCHAR LA PETICION DE MAS UER PUBS:
   */
  private listenToMorePubs() {
    this.morePubsSubscriber = this._ownPubsService.moreOwnPubsRequest$.subscribe((more: boolean) => {
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

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES DEL USUARIO LOGGEADO, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  private getMyPubList(more: boolean = false) {
    if (more) {
      this._userPubsService.getMoreUserPubs(this.pagePattern, this.myPubList).then((userPubData: { userPubs: Publication[], pagePattern: string }) => {
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
        this.pagePattern = userPubData.pagePattern;
        this.myPubList = userPubData.userPubs;
        this._userPubsService.loadOwnPubs(this.myPubList);
      });
    }
    else {
      this._userPubsService.getUserPubList().then((userPubData: { userPubs: Publication[], pagePattern: string }) => {
        this.pagePattern = userPubData.pagePattern;
        this.myPubList = userPubData.userPubs;
        this._userPubsService.loadOwnPubs(this.myPubList);
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
   * MÉTODO PARA ESCUCHAR LOS CAMBIOS DE LAS PUBLICACIONES PROPIAS DEL USUARIO QUE VIENEN TRAVES DEL SOCKET.IO CLIENT:
   */
  private listenToOwnPubUpdate() {
    this.pubUpdateSub = this._userPubsService.updatedOwnPub$.subscribe((ownPubData: { userPubJson: any, action: string }) => {
      if (ownPubData) {
        if (this.myPubList) {
          this._userPubsService.updateuserPubList(ownPubData.userPubJson, ownPubData.action, this.myPubList);
          this._userPubsService.loadOwnPubs(this.myPubList);
        }
      }
    });
  }

  /**
   * MÉTODO PARA ESCUCHAR LOS CAMBIOS DE LAS PUBLICACIONES PROPIAS DEL USUARIO QUE VIENEN TRAVES DEL SOCKET.IO CLIENT:
   */
  private listenToOffUserPub() {
    this.offPubSub = this._userPubsService.newOffUserPub$.subscribe((offPub: Publication) => {
      if (offPub) {
        this.myPubList.splice(0, 0, offPub);
        this._userPubsService.loadOwnPubs(this.myPubList);
      }
    });
  }

  ngOnDestroy() {
    this.morePubsSubscriber.unsubscribe();
    this.offPubSub.unsubscribe();
    this.pubUpdateSub.unsubscribe();
  }
}
