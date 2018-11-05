import { Component, OnInit, Input, Output, SimpleChanges, OnChanges, EventEmitter, OnDestroy } from '@angular/core';
import { CONTENT_TYPES } from '../../config/content-type';
import { ContentService } from '../../services/content.service';
import { MENU_OPTIONS } from '../../config/menu-option';
import { Subscription } from '../../../../node_modules/rxjs';
import { Router } from '../../../../node_modules/@angular/router';
import { LoginService } from '../../services/login.service';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { NavigationPanelService } from 'src/app/services/navigation-panel.service';

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

  public contentTypes: any;
  public menuOptions: any;

  constructor(
    private _navigationPanelService: NavigationPanelService,
    private _dynaContentService: DynaContentService,
    private _contentService: ContentService,
    private _router: Router,
    private _loginService: LoginService
  ) {
    this.contentTypes = CONTENT_TYPES;
    this.menuOptions = MENU_OPTIONS;

    this.subscriber = this._navigationPanelService.navigateMenu$.subscribe((menuOption: number) => {
      let idOp;
      switch (menuOption) {
        case MENU_OPTIONS.home:
          idOp = 'top-option-0';
          break;
        case MENU_OPTIONS.mapview:
          idOp = 'top-option-1';
          break;
        case MENU_OPTIONS.payment:
          idOp = 'top-option-2';
          break;
      }
      if (menuOption != -1) {
        this.focusOption(null, idOp, menuOption, false);
      }
    });
  }

  ngOnInit() { }

  /**
   * MÉTODO PARA SOLICITAR QUE SE INCRUSTE DINÁMICAMENTE UN HORIZON MODAL CON CIERTO CONTENIDO EN SU INTERIOR
   * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
   * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
   */
  public openLayer(event: any, contType: number) {
    event.preventDefault();
    if (contType === this.contentTypes.view_notifs) {
      this.seenEntries.emit(true);
    }
    this._dynaContentService.loadDynaContent({ contentType: contType, contentData: "" });
  }

  /**
   * MÉTODO PARA SOLICITAR QUE SE DE FOCUS A UNA OPCIÓN SELECCIONADA DEL MENÚ DE NAVEGACIÓN:
   * @param idContent ID HTML DE LA OPCIÓN SELECCIONADA
   */
  public focusOption(event: any, idContent: string, menuOption: number, notify: boolean = true) {
    if (event) {
      event.preventDefault();
    }
    this._contentService.focusMenuOption($('#id-top-panel'), idContent);
    if (notify === true) {
      setTimeout(() => {
        this._navigationPanelService.navigateContent(menuOption);
      }, 300);
    }
  }

  /**
  * MÉTODO PARA SALIR DE LA APP
  **/
  public logout(event: any) {
    event.preventDefault();
    this._loginService.logout();
    this._router.navigate(['/login']);
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

  ngOnDestroy() {
    this._dynaContentService.loadDynaContent(null);

    this.subscriber.unsubscribe();
  }
}
