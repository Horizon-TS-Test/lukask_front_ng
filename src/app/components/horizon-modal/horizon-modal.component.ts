import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-horizon-modal',
  templateUrl: './horizon-modal.component.html',
  styleUrls: ['./horizon-modal.component.css']
})
export class HorizonModalComponent implements OnInit, OnDestroy {
  private subscriber: Subscription;

  public _ref: any;
  public _dynaContent: DynaContent;
  public contentTypes: any;

  public backgroundClass: string;
  public showClass: string;

  constructor(
    private _notifierService: NotifierService
  ) {
    this.contentTypes = CONTENT_TYPES;

    this.subscriber = this._notifierService._closeModal.subscribe((closeIt: boolean) => {
      this.close(closeIt);
    });
  }

  ngOnInit() { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.backgroundClass = "on";
      this.showClass = "show";
    }, 100);
  }

  /**
   * MÉTODO PARA DAR EL EFECTO DE DESVANECIMIENTO DEL MODAL PARA LUEGO CERRARLO:
   */
  closeModal() {
    this.backgroundClass = "";
    this.showClass = "";

    setTimeout(() => {
      this.removeObject();
    }, 300);
  }

  /**
   * MÉTODO PARA CERRAR EL MODAL DESDE UN BOTÓN HIJO:
   * @param closeEvent DATO QUE LLEGA DEL EVENT EMITTER
   */
  close(closeEvent: Boolean) {
    if (closeEvent) {
      this.closeModal();
    }
  }

  /**
   * MÉTODO PARA CERRAR EL MODAL AL DAR CLICK FUERA DEL MISMO:
   * @param event 
   */
  onClickClose(event: any) {
    event.preventDefault();
    this.closeModal();
  }

  /**
   * MÉTODO PARA ELIMINAR LA REFERENCIA DE ESTE COMPONENTE DINÁMICO DENTRO DE TODA LA APP
   */
  removeObject() {
    this._ref.destroy();
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}