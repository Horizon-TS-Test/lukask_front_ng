import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-own-pubs',
  templateUrl: './own-pubs.component.html',
  styleUrls: ['./own-pubs.component.css']
})
export class OwnPubsComponent implements OnInit {
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private subscriptor: Subscription;
  public styles: any;
  public myPubList: Publication[];
  public mainLoadingClass: string;
  public mainActiveClass: string;
  public activeClass: string;

  constructor(
    private _quejaService: QuejaService,
    private _notifierService: NotifierService
  ) {
    /**
     * SUBSCRIPCIÓN PARA CAPTAR EL LLAMADO DEL COMPONENTE INICIO QUIEN SOLICITA 
     * LA CARGA DE MAS COMPONENTES AL LLEGAR EL SCROLL DEL USUARIO AL FINAL DE LA PÁGINA
     */
    this.subscriptor = this._notifierService._morePubsRequest.subscribe((morePubs) => {
      if (morePubs) {
        this.getMorePubs();
      }
    });
    /*** */
  }

  ngOnInit() {
    this.loadingAnimation();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getMyPubList();
    }, 1000);
  }

  /**
   * MÉTODO PARA ACTIVAR EL EECTO DE CARGANDO:
   */
  private loadingAnimation(hide: boolean = false) {
    if (hide) {
      this.mainLoadingClass = "";
      this.mainActiveClass = "";
    }
    else {
      this.mainLoadingClass = "on";
      this.mainActiveClass = "active";
    }
  }

  /**
   * FUNCIÓN PARA OBTENER UN NÚMERO INICIAL DE PUBLICACIONES, PARA DESPUÉS CARGAR MAS PUBLICACIONES BAJO DEMANDA
   */
  getMyPubList() {
    this._quejaService.getPubList(true).then((pubs: Publication[]) => {
      this.myPubList = pubs;
      this.activeClass = this.LOADER_HIDE;
      this.loadingAnimation(true);
    }).catch(err => {
      console.log(err);
      this.activeClass = this.LOADER_HIDE;
      this.loadingAnimation(true);
    });
  }

  /**
   * FUNCIÓN PARA OBTENER PUBLICACIONES BAJO DEMANDA A TRAVÉS DE UN PATTERN DE PAGINACIÓN:
   */
  getMorePubs() {
    if (this.myPubList && this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      this._quejaService.getMorePubs(true).then((morePubs: Publication[]) => {
        setTimeout(() => {
          this.activeClass = "";

          setTimeout(() => {
            this.activeClass = this.LOADER_HIDE;
            this.myPubList = morePubs;
          }, 800);

        }, 1000);
      }).catch(err => {
        console.log(err);

        setTimeout(() => {
          this.activeClass = "";

          setTimeout(() => {
            this.activeClass = this.LOADER_HIDE;
          }, 800);

        }, 1000)
      });
    }
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}
