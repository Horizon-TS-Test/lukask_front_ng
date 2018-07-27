import { Component, OnInit, AfterViewInit } from '@angular/core';
import planillasData from '../../data/planillas-data';
import { Planilla } from '../../interfaces/planilla-interface';
import { FormBuilder, FormGroup, Validators } from '../../../../node_modules/@angular/forms';

declare var $: any;

@Component({
  selector: 'find-accounts',
  templateUrl: './find-accounts.component.html',
  styleUrls: ['./find-accounts.component.css']
})
export class FindAccountsComponent implements OnInit, AfterViewInit {

  public planillas: Planilla[];
  public pagos1: Planilla[];
  public formAcc: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.pagos1 = [];
  }

  ngOnInit() {
    this.formAcc = this.setFormGroup();
  }

  ngAfterViewInit() {
    this.planillas = planillasData;
  }

  /**
   * MÉTODO PARA INICIALIZAR EL FORMULARIO:
   */
  private setFormGroup(): FormGroup {
    const formGroup = this.formBuilder.group({
      fcnCedula: [null, Validators.required]
    });
    return formGroup;
  }

  /** MÉTODO PARA AGREGAR ANIME CARGANDO
  */
  /*activeLoadingContent(remove: boolean = false) {
    if (remove) {
      $("#loading-content").removeClass("active");
    }
    else {
      $("#loading-content").addClass("active");
    }
  }*/

  /**
    * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL
    * PARA LA PAGINA DE BUSQUEDA DE LAS PLANILLAS DE PAGOS
    * AND PARA PODER OBSERVAR EL DIV DE LAS PLANILLAS ENCONTRADAS
    * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
    * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
    **/
  openLayer(event: any) {
    //console.log("CEDULA DEL USUARIO: ", this.planillas.ci);
    /**
     * METODO PARA RECORRER EL ARRAY DE LAS PLANILLAS (PATRICIA ALLAUCA)
     */
    /*let c = this.planillas.ci;
    let i = 0;
    this.pagos1 = [];
    for (var item in this.planillas) {
      if (c == this.planillas[item].ci) {
        i = i + 1;
        this.pagos1.push(this.planillas[item]);

      }
    }*/
    /*this.activeLoadingContent();
    this.activeLoadingContent(true);*/
    /*LINEA PARA HACERLE VISIBLE AL DIV DE LAS PLANILLAS */
    //document.getElementById("divpagos").style.display = "block";
  }


  /**
   * MÉTODO PARA PROCESAR EL SUBMIT DEL FORMULARIO PARA BUSCAR LAS CUENTAS DE SERVICIOS BÁSICOS:
   */
  findAccounts() {
    console.log("SUBMITEANDO!! :D");
  }
}
