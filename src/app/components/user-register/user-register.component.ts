import { Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { User } from '../../models/user';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { ACTION_TYPES } from '../../config/action-types';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';

@Component({
  selector: 'user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit, OnChanges {
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<boolean>();

  public newUser: User;
  public materialButtons: HorizonButton[];
  public userObj: User;
  public carouselOptions: any;
  public actionType: number;
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private _notifierService: NotifierService,
    public _domSanitizer: DomSanitizer
  ) {
    this.newUser = new User(null, null);
    this.materialButtons = [
      {
        action: ACTION_TYPES.userRegister,
        icon: "check"
      },
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ]
  }

  ngOnInit() {
    this.initCarousel();
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  private initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false
    };
  }

  /**
   * MÉTODO PARA ACTIVAR EL EECTO DE CARGANDO:
   */
  private loadingAnimation() {
    this.loadingClass = "on";
    this.activeClass = "active";
  }

  /**
  * MÉTODO PARA MOSTRAR EL MODAL DE LA CAMARA
  * @param event = EVENTO DE LA CAMARA
  */
  newMedia(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.new_media, contentData: null });
  }

  /**
   * MÉTODO PARA OBTENER EL EVENTO DEL COMPONENTE HIJO LUEGO DEL SUBMIT
   * @param event VALOR BOOLEANO DEL EVENT EMITTER
   */
  childAfterSubmit(event: any) {
    if (event) {
      this.closeModal.emit(true);
    }
  }

  /**
  * MÉTODO PARA EJECUTAR LA FUNCION SEGUN LA ACCION DEL BOTON
  * @param event = EVENTO DE LA CAMARA
  */
  actionBtn(event: number) {
    switch (event) {
      case ACTION_TYPES.userRegister:
        this.actionType = null;
        setTimeout(() => {
          this.actionType = ACTION_TYPES.userRegister;
          this.showClass = "";
        });
        this.loadingAnimation();
        break;
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

  /**
   * MÉTODO PARA ESCUCHAR LOS CAMBIOS QUE SE DEN EN EL ATRIBUTO QUE VIENE DESDE EL COMPONENTE PADRE:
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      switch (property) {
        case 'showClass':
          if (changes[property].currentValue !== undefined) {
            this.showClass = changes[property].currentValue;
          }
          break;
      }
    }
  }
}
