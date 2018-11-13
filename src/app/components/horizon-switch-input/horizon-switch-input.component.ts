import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { HorizonSwitchInputInterface } from '../../interfaces/horizon-switch-in.interface';

@Component({
  selector: 'horizon-switch-input',
  templateUrl: './horizon-switch-input.component.html',
  styleUrls: ['./horizon-switch-input.component.css']
})
export class HorizonSwitchInputComponent implements OnInit, OnChanges {
  @Input() switchInput: HorizonSwitchInputInterface;
  @Output() onChange: EventEmitter<HorizonSwitchInputInterface>;

  constructor() {
    this.onChange = new EventEmitter<HorizonSwitchInputInterface>();
  }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA DETECTAR EL CAMBIO DE ESTADO DEL SWITCH INPUT:
   * @param event 
   */
  switchChange(event: any) {
    if (this.switchInput.immutable == true) {
      if (!this.switchInput.checked == true) {
        this.switchInput.checked = !this.switchInput.checked;
        this.onChange.emit(this.switchInput);
      }
      else {
        event.preventDefault();
      }
    }
    else {
      this.switchInput.checked = !this.switchInput.checked;
      this.onChange.emit(this.switchInput);
    }
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      switch (property) {
        case 'switchInput':
          if (changes[property].currentValue) {
            this.switchInput = changes[property].currentValue;
          }
          break;
      }
    }
  }

}