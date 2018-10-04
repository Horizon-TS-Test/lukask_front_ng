import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HorizonSwitchInputInterface } from '../../interfaces/horizon-switch-in.interface';

@Component({
  selector: 'horizon-switch-in-list',
  templateUrl: './horizon-switch-in-list.component.html',
  styleUrls: ['./horizon-switch-in-list.component.css']
})
export class HorizonSwitchInListComponent implements OnInit {
  @Input() switchIns: HorizonSwitchInputInterface[];
  @Output() selectedInput: EventEmitter<string>;

  constructor() {
    this.selectedInput = new EventEmitter<string>();
  }

  ngOnInit() {
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DEL SWITCH INPUT COMO COMPONENTE HIJO
   * @param event VALOR BOOLEANO DEL EVENT EMITTER DEL COMPONENTE HIJO
   */
  public getSwitchChanges(event: HorizonSwitchInputInterface) {
    for (let i = 0; i < this.switchIns.length; i++) {
      if (event.id != this.switchIns[i].id) {
        this.switchIns[i].checked = false;
      }
    }

    this.selectedInput.emit(event.id);
  }

}