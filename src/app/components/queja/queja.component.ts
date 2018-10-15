import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Publication } from '../../models/publications';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { ActionService } from '../../services/action.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Subscription } from 'rxjs';
import { ACTION_TYPES } from '../../config/action-types';

@Component({
  selector: 'app-queja',
  templateUrl: './queja.component.html',
  styleUrls: ['./queja.component.css'],
  providers: [ActionService]
})
export class QuejaComponent implements OnInit, OnDestroy {
  @Input() queja: Publication;
  @Output() actionType = new EventEmitter<number>();
  @Output() onCancelPub = new EventEmitter<Publication>();

  private subscription: Subscription;
  public userProfile: User;

  constructor(
    public _domSanitizer: DomSanitizer,
    private _notifierService: NotifierService,
    private _userService: UserService
  ) {
    this.subscription = this._userService._userUpdate.subscribe((update: boolean) => {
      if (update) {
        this.setOwnUserProfile();
      }
    });
  }

  ngOnInit() { }

  /**
   * MÉTODO QUE ESCUCHA LA ACTUALIZACIÓN DE LOS DATOS DE PERFIL DEL USUARIO LOGEADO 
   * PARA ACTUALIZAR LA INFORMACIÓN DE LAS PUBLICACIONES QUE PERTENECEN AL MISMO PERFIL:
   */
  private setOwnUserProfile() {
    this.userProfile = this._userService.getUserProfile();
    if (this.queja.user.id == this.userProfile.id) {
      this.queja.user = this.userProfile;
    }
  }

  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL PARA VER EL DETALLE DE UNA QUEJA:
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public viewQuejaDetail(event: any) {
    event.preventDefault();
    if (!this.queja.isOffline) {
      this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.view_queja, contentData: this.queja.id_publication });
    }
  }

  /**
   * MÉTODO PARA CAPTAR LA ACCIÓN DE ALGÚN BOTÓN DEL LA LSITA DE BOTONES, COMPONENTE HIJO
   * @param $event VALOR DEL TIPO DE ACCIÓN QUE VIENE EN UN EVENT-EMITTER
   */
  public optionButtonAction(event: number) {
    if (event === ACTION_TYPES.mapFocus) {
      this.actionType.emit(event);
    }
  }

  /**
   * MÉTODO PARA CANCELAR EL ENVÍO DE LA PUBLICACIÓN OFFLINE:
   * @param event
   */
  public cancelPub(event: any) {
    event.preventDefault();
    this.onCancelPub.emit(this.queja);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
