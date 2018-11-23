import { Component, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { Publication } from '../../models/publications';
import { DynaContent } from 'src/app/interfaces/dyna-content.interface';
import { UserPubsService } from 'src/app/services/user-pubs.service';

@Component({
  selector: 'user-pubs',
  templateUrl: './user-pubs.component.html',
  styleUrls: ['./user-pubs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPubsComponent {
  @Output() geoMap: EventEmitter<DynaContent>;
  @Output() onCancelPub: EventEmitter<Publication>;

  constructor(
    public _userPubsService: UserPubsService
  ) {
    this.geoMap = new EventEmitter<DynaContent>();
    this.onCancelPub = new EventEmitter<Publication>();
  }

  /**
   * METODO PARA MOSTRAR LA QUEJA EN EL MAPA DADO EL VALO DEL EVENT EMITTER DEL COMPONENTE HIJO:
   * @param $event 
   */
  public geolocatePub(action: number, pubId: string) {
    this.geoMap.emit({ contentType: action, contentData: pubId });
  }

  /**
   * METODO PARA CANCELAR UN RECLAMO OFFLINE:
   * @param event 
   */
  public cancelPub(event: Publication) {
    this.onCancelPub.emit(event);
  }
}
