import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import { DynaContent } from 'src/app/interfaces/dyna-content.interface';
import { ACTION_TYPES } from 'src/app/config/action-types';

@Component({
  selector: 'app-own-pubs',
  templateUrl: './own-pubs.component.html',
  styleUrls: ['./own-pubs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnPubsComponent implements OnInit {
  @Output() geoMap = new EventEmitter<DynaContent>();

  private subscriptor: Subscription;
  public styles: any;
  public myPubList: Publication[];
  public activeClass: string;

  constructor(
    private _quejaService: QuejaService
  ) {
  }

  ngOnInit() {
    this.listenToOwnPubs();
  }

  /**
   * METODO PARA ESCUCHAR LAS ACTUALIZACIONES DE PUBS PROPIAS DEL USUARIO QUE LLEGAN BAJO DEMANDA
   */
  private listenToOwnPubs() {
    this.subscriptor = this._quejaService.ownPubs$.subscribe((ownPubs) => {
    });
  }

  /**
   * METODO PARA MOSTRAR LA QUEJA EN EL MAPA DADO EL VALO DEL EVENT EMITTER DEL COMPONENTE HIJO:
   * @param $event 
   */
  public geolocatePub(action: number, pubId: string) {
    this.geoMap.emit({ contentType: action, contentData: pubId });
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}
