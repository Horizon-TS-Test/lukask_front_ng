import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { PaymentsService } from '../../services/payments.service';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import { CONTENT_TYPES } from '../../config/content-type';
import { Planilla } from '../../interfaces/planilla-interface';
import { ACTION_TYPES } from '../../config/action-types';
import { DynaContentService } from 'src/app/services/dyna-content.service';

@Component({
  selector: 'planilla-detail',
  templateUrl: './planilla-detail.component.html',
  styleUrls: ['./planilla-detail.component.css']
})
export class PlanillaDetailComponent implements OnInit {
  @Input() planilla: Planilla;
  @Input() showClass: string;
  @Output() closeModal: EventEmitter<boolean>;

  public matButtons: HorizonButton[];
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private _payments: PaymentsService,
    private _dynaContentService: DynaContentService

  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        action: ACTION_TYPES.close,
        icon: "close"
      }
    ];
  }

  ngOnInit() { }

  /**
     * METODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL 
     * PARA VER LA PAGINA DE PAYPAL PARA CONSUMIR
     * @param err CUANDO EL SERVIDOR NO RESPONDE O DAMOS MAL LOS DATOS
     */
  public envioPagos(event: any) {
    event.preventDefault();
    this.loadingClass = "on";
    this.activeClass = "active";
    this.showClass = "";
    this._payments.postPagosClient(this.planilla).then((data) => {
      console.log("[LA URL QUE ENVIA PAYPAL PARA CANCELAR]", data);
      this.closeModal.emit(true);
      this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.paypal, contentData: data.data.data });
    }, (err) => {
      console.log("[CUANDO NOS DA UN ERROR DEL SERVIDOR]", err);
      this.loadingClass = "";
      this.activeClass = "";
  
      let alertData = new Alert({ title: "Error de Conexión", message: "Sentimos los inconvenientes, estamos trabajando para mejorar tu experiencia de usuario.", type: ALERT_TYPES.danger });
      this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.alert, contentData: alertData });
  
      this.closeModal.emit(true);
    });
  }

  /**
   * METODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL 
   * PARA VER LA PAGINA DE PAYPAL PARA CONSUMIR POR TARJETA DE CREDITO
   * @param err CUANDO EL SERVIDOR NO RESPONDE O DAMOS MAL LOS DATOS
  */
  public envioPagosCard(event: any) {
    event.preventDefault();
    this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.payment_card, contentData: this.planilla });
  }

  /**
   * METODO PARA REALIZAR UNA ACCIÓN AL DAR CLICK EN UN BOTÓN DE UN MODAL 
   * @param actionEvent 
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.close:
        this.closeModal.emit(true);
        break;
    }
  }

}
