import { Component, OnInit } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';

@Component({
  selector: 'app-horizon-pop-over',
  templateUrl: './horizon-pop-over.component.html',
  styleUrls: ['./horizon-pop-over.component.css']
})
export class HorizonPopOverComponent implements OnInit {
  public _ref: any;
  public _dynaContent: DynaContent;
  public visibleClass: string;
  public backgroundClass: string;

  constructor() { }

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
}
