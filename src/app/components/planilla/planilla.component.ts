import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CONTENT_TYPES } from '../../config/content-type';
import { Planilla } from '../../interfaces/planilla-interface';
import { DynaContentService } from 'src/app/services/dyna-content.service';

@Component({
  selector: 'planilla',
  templateUrl: './planilla.component.html',
  styleUrls: ['./planilla.component.css']
})
export class PlanillaComponent implements OnInit {
  @Input() userPlanilla: Planilla;
  @Output() closePop = new EventEmitter<boolean>();

  constructor(
    public _domSanitizer: DomSanitizer,
    private _dynaContentService: DynaContentService
  ) { }

  ngOnInit() { }
  /**
   * MÉTODO PARA SOLICITAR LA APERTURA DE UN HORIZON MODAL 
   * PARA VER EL DETALLE DE LA PLANILLA A PAGAR
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  viewPlanillaDetail(event: any) {
    event.preventDefault();
    this.closePop.emit(true);
    setTimeout(() => {
      this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.planilla_detail, contentData: this.userPlanilla });
    }, 400);
  }
}
