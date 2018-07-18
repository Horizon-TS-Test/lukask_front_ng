import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import planillasData from '../../data/planillas-data';
import { Payment } from '../../models/payments';

declare var $: any;

@Component({
  selector: 'app-pagos-busqueda',
  templateUrl: './pagos-busqueda.component.html',
  styleUrls: ['./pagos-busqueda.component.css']
})
export class PagosBusquedaComponent implements OnInit {
  @Output() closeModal: EventEmitter<boolean>;
  @Input() pagos: Payment;
  @Input() pagos1: Payment;

  private _CLOSE = 1;
  private self: any;
  public _dynaContent: DynaContent;
  public formQuej: FormGroup;
  public matButtons: HorizonButton[];




  constructor(
    private formBuilder: FormBuilder
  ) {
    this.closeModal = new EventEmitter<boolean>();
    this.pagos = planillasData;
    this.pagos1 = [];



    this.matButtons = [
      {
        parentContentType: 0,
        action: this._CLOSE,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    this.self = $("#personal-edit-q");
    $("#hidden-btn").on(("click"), (event) => { }); //NO TOCAR!

  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

  /** MÉTODO PARA SOLICITAR QUE SE INCRUSTE DINÁMICAMENTE UN HORIZON MODAL CON CIERTO CONTENIDO EN SU INTERIOR
  * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
  * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
  */
  openLayer(event: any) {
    //Poner el Array y poner visible el div
    console.log("ingresooo a openlayer");
    console.log(this.pagos.ci);
    let c = this.pagos.ci;
    let i = 0;
    this.pagos1 =[];
    for (var item in this.pagos) {
      if (c == this.pagos[item].ci) {
        i = i + 1;
        this.pagos1.push(this.pagos[item]);
        
      }
    }
    document.getElementById("divpagos").style.display = "block";

  }
}
