import { Component, OnInit } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from '../../../../node_modules/rxjs';
import { DynaContentService } from 'src/app/services/dyna-content.service';

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
  public progressClass:String;

  public contentTypes: any;

  constructor(
    private _dynaContentService: DynaContentService
  ) {
    this.contentTypes = CONTENT_TYPES;
    this.progressClass = "";
    this.subscriber = this._dynaContentService.removeDynaCont$.subscribe((closeIt: boolean) => {
      if (closeIt) {
        this.closePopOver();
      }
    });
  }

  ngOnInit() {
    if(this._dynaContent && this._dynaContent.contentType === CONTENT_TYPES.progress_bar){
      this.progressClass = "progress-content";
    }

    setTimeout(() => {
      this.backgroundClass = "on"
      this.visibleClass = "is-visible"
    }, 100);
  }

  /**
   * METODO PARA DAR EL EFECTO DE ENCOGIMIENTO DEL POP OVER PARA LUEGO CERRARLO:
   */
  private closePopOver() {
    this.backgroundClass = ""
    this.visibleClass = ""

    setTimeout(() => {
      this.removeObject();
    }, 300);
  }

  /**
   * METODO PARA ELIMINAR LA REFERENCIA DE ESTE COMPONENTE DINÁMICO DENTRO DE TODA LA APP
   */
  private removeObject() {
    this._ref.destroy();
  }

  /**
   * METODO PARA CERRAR EL POP OVER AL DAR CLICK FUERA DEL MISMO:
   * @param event 
   */
  public onClickClose(event: any) {
    event.preventDefault();
    if(this._dynaContent.contentType != CONTENT_TYPES.progress_bar){
      this.closePopOver();
    }
  }

  /**
   * METODO PARA CERRAR EL POP OVER DESDE EL COMPONENTE HIJO USANDO EVENT EMITTER
   * @param $event VALOR DEL EVENT EMITTER
   */
  closePopFromChild(event: boolean) {
    if (event) {
      this.closePopOver();
    }
  }
}
