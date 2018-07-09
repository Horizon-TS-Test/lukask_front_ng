import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Publication } from '../../models/publications';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { ActionService } from '../../services/action.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Subscription } from 'rxjs';
import { Pagos } from '../../interfaces/planillas-data';
import planillasData from '../../data/planillas-data';

@Component({
  selector: 'app-pagos-datos',
  templateUrl: './pagos-datos.component.html',
  styleUrls: ['./pagos-datos.component.css']
})
export class PagosDatosComponent implements OnInit {
  public Pagoslist: Pagos[]; 

  private subscription: Subscription;
  public userProfile: User;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _notifierService: NotifierService,
    private _userService: UserService
  ) { 

    this.Pagoslist = planillasData;
  }

  ngOnInit() {
  }
 
 

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA VER EL DETALLE DE UNA QUEJA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  viewQuejaDetail(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.new_queja, contentData: this.Pagoslist[0].direccion });
  }
}
