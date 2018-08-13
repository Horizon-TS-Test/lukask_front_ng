import { Component, OnInit } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from '../../../../node_modules/rxjs';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-horizon-pop-over',
  templateUrl: './horizon-pop-over.component.html',
  styleUrls: ['./horizon-pop-over.component.css']
})
export class HorizonPopOverComponent implements OnInit {
  private subscriber: Subscription;

  public _ref: any;
  public _dynaContent: DynaContent;
  public visibleClass: string;
  public backgroundClass: string;

  public contentTypes: any;

  constructor(
    private _notifierService: NotifierService
  ) {
    this.contentTypes = CONTENT_TYPES;
    this.subscriber = this._notifierService._closeModal.subscribe((closeIt: boolean) => {
      if (closeIt) {
        this.closePopOver();
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.backgroundClass = "on"
      this.visibleClass = "is-visible"
    }, 100);
  }

  /**
   * MÉTODO PARA DAR EL EFECTO DE ENCOGIMIENTO DEL POP OVER PARA LUEGO CERRARLO:
   */
  private closePopOver() {
    this.backgroundClass = ""
    this.visibleClass = ""

    setTimeout(() => {
      this.removeObject();
    }, 300);
  }

  /**
   * MÉTODO PARA ELIMINAR LA REFERENCIA DE ESTE COMPONENTE DINÁMICO DENTRO DE TODA LA APP
   */
  private removeObject() {
    this._ref.destroy();
  }

  /**
   * MÉTODO PARA CERRAR EL POP OVER AL DAR CLICK FUERA DEL MISMO:
   * @param event 
   */
  public onClickClose(event: any) {
    event.preventDefault();
    this.closePopOver();
  }

  /**
   * MÉTODO PARA CERRAR EL POP OVER DESDE EL COMPONENTE HIJO USANDO EVENT EMITTER
   * @param $event VALOR DEL EVENT EMITTER
   */
  closePopFromChild(event: boolean) {
    if (event) {
      this.closePopOver();
    }
  }
}
