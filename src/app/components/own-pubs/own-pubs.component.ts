import { Component, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { Publication } from '../../models/publications';
import { DynaContent } from 'src/app/interfaces/dyna-content.interface';
import { UserPubsService } from 'src/app/services/user-pubs.service';

@Component({
  selector: 'app-own-pubs',
  templateUrl: './own-pubs.component.html',
  styleUrls: ['./own-pubs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnPubsComponent {
  @Output() geoMap = new EventEmitter<DynaContent>();

  public myPubList: Publication[];

  constructor(
    public _userPubsService: UserPubsService
  ) {
  }

  /**
   * METODO PARA MOSTRAR LA QUEJA EN EL MAPA DADO EL VALO DEL EVENT EMITTER DEL COMPONENTE HIJO:
   * @param $event 
   */
  public geolocatePub(action: number, pubId: string) {
    this.geoMap.emit({ contentType: action, contentData: pubId });
  }
}
