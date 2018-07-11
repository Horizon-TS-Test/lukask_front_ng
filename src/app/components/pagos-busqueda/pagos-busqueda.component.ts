import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { Pagos } from '../../interfaces/planillas-data';
import planillasData from '../../data/planillas-data';


declare var $: any;

@Component({
  selector: 'app-pagos-busqueda',
  templateUrl: './pagos-busqueda.component.html',
  styleUrls: ['./pagos-busqueda.component.css']
})
export class PagosBusquedaComponent implements OnInit{
  @Output() closeModal: EventEmitter<boolean>;
  @Input() pagos: Pagos[];
  @Input() pagosPlanilla: Pagos[];
  private _CLOSE = 1;
    private self: any;
  public cedula:'';
  public _dynaContent: DynaContent;
  public formQuej: FormGroup;
  public matButtons: HorizonButton[];
  

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.pagos = planillasData;
    this.closeModal = new EventEmitter<boolean>();
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
    document.getElementById("divpagos").style.display = "block";
   }
}
