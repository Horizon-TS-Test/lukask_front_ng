import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import planillasData from '../../data/planillas-data';
import { Planilla } from '../../interfaces/planilla-interface';
import { FormBuilder, FormGroup, Validators } from '../../../../node_modules/@angular/forms';
import { ContentService } from '../../services/content.service';

declare var $: any;

@Component({
  selector: 'find-accounts',
  templateUrl: './find-accounts.component.html',
  styleUrls: ['./find-accounts.component.css']
})
export class FindAccountsComponent implements OnInit, AfterViewInit {
  @Output() closePop = new EventEmitter<boolean>();

  public planillas: Planilla[];
  public formAcc: FormGroup;
  public accounts: boolean;
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private formBuilder: FormBuilder,
    private _contentService: ContentService
  ) { }

  ngOnInit() {
    this.formAcc = this.setFormGroup();
  }

  ngAfterViewInit() {
    this.planillas = planillasData.slice();
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

  /**
   * MÉTODO PARA ACTIVAR EL EECTO DE CARGANDO:
   */
  private loadingAnimation() {
    this.loadingClass = "on";
    this.activeClass = "active";

    setTimeout(() => {
      this.accounts = true;
      
      this.loadingClass = "";
      this.activeClass = "";

      this._contentService.elementScrollInside($("#findPlanilla"), $("#frmA").offset().top - 10);
    }, 1000);
  }

  /**
   * MÉTODO PARA PROCESAR EL SUBMIT DEL FORMULARIO PARA BUSCAR LAS CUENTAS DE SERVICIOS BÁSICOS:
   */
  public findAccounts() {
    let userCi = this.formAcc.value.fcnCedula;

    for (let i = 0; i < this.planillas.length; i++) {
      if (userCi !== parseInt(this.planillas[i].ci)) {
        this.planillas.splice(i, 1);
        i--;
      }
    }
    
    this.loadingAnimation();
  }

  /**
   * MÉTODO PARA CAPTAR EL VALOR DEL EVENT EMITTER DEL COMPONENTE HIJO PARA CERRAR EL POP OVER:
   * @param event VALOR DEL EVENT EMITTER
   */
  getChildAction(event: boolean) {
    this.closePop.emit(true);
  }
}
