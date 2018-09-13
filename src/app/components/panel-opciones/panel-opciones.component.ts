import { Component, OnInit, Input, Output, SimpleChanges, OnChanges, EventEmitter, OnDestroy } from '@angular/core';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { ContentService } from '../../services/content.service';
import { MENU_OPTIONS } from '../../config/menu-option';
import { Subscription } from '../../../../node_modules/rxjs';
import { Router } from '../../../../node_modules/@angular/router';
import { LoginService } from '../../services/login.service';
import { UserService } from '../../services/user.service';

declare var $: any;

@Component({
  selector: 'app-panel-opciones',
  templateUrl: './panel-opciones.component.html',
  styleUrls: ['./panel-opciones.component.css']
})
export class PanelOpcionesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() entriesNumber: number;
  @Output() seenEntries = new EventEmitter<boolean>();

  private subscriber: Subscription;
  private adminSubscriber: Subscription;

  public contentTypes: any;
  public menuOptions: any;
  public isAdmin: boolean;

  constructor(
    private _userService: UserService,
    private _notifierService: NotifierService,
    private _contentService: ContentService,
    private _router: Router,
    private _loginService: LoginService,
  ) {
    this.contentTypes = CONTENT_TYPES;
    this.menuOptions = MENU_OPTIONS;

    this.listenMenuChanges();
  }

  ngOnInit() {
    this.listenAdminFlag();
  }

  /**
   * LISTEN TO EVENT EMITTER WITH ADMIN/USER FLAG:
   */
  listenAdminFlag() {
    this.adminSubscriber = this._userService._userUpdate.subscribe((resp) => {
      if(resp) {
        this.isAdmin = this._userService.verifyIsAdmin();
        console.log(this.isAdmin);
      }
    });
  }

  /**
   * MÉTODO PARA ESCUCHAR LOS CAMBIOS DE LA OPCIÓN DE MENÚ:
   */
  listenMenuChanges() {
    this.subscriber = this._notifierService._changeMenuContent.subscribe((menuOption: number) => {
      let idOp;
      switch (menuOption) {
        case MENU_OPTIONS.home:
          idOp = 'top-option-0';
          break;
        case MENU_OPTIONS.mapview:
          idOp = 'top-option-1';
          break;
        case MENU_OPTIONS.ownPubs:
          idOp = 'top-option-2';
          break;
      }
      this.focusOption(null, idOp, menuOption, false);
    });
  }

  /**
   * MÉTODO PARA SOLICITAR QUE SE INCRUSTE DINÁMICAMENTE UN HORIZON MODAL CON CIERTO CONTENIDO EN SU INTERIOR
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
   */
  openLayer(event: any, contType: number) {
    event.preventDefault();
    if (contType === this.contentTypes.view_notifs) {
      this.seenEntries.emit(true);
    }
    this._notifierService.notifyNewContent({ contentType: contType, contentData: "" });
  }

  /**
   * MÉTODO PARA SOLICITAR QUE SE DE FOCUS A UNA OPCIÓN SELECCIONADA DEL MENÚ DE NAVEGACIÓN:
   * @param idContent ID HTML DE LA OPCIÓN SELECCIONADA
   */
  focusOption(event: any, idContent: string, menuOption: number, notify: boolean = true) {
    if (event) {
      event.preventDefault();
    }
    this._contentService.focusMenuOption($('#id-top-panel'), idContent);
    if (notify === true) {
      this._notifierService.notifyChangeMenuOption(menuOption);
    }
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {

    for (const property in changes) {
      if (property === 'entriesNumber') {
        /*console.log('Previous:', changes[property].previousValue);
        console.log('Current:', changes[property].currentValue);
        console.log('firstChange:', changes[property].firstChange);*/

        if (changes[property].currentValue) {
          this.entriesNumber = changes[property].currentValue;
        }
      }
    }
  }

  /**
  * MÉTODO PARA SALIR DE LA APP
  **/
  logout(event: any) {
    event.preventDefault();
    this._loginService.logout();
    this._router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
    this.adminSubscriber.unsubscribe();
  }
}
