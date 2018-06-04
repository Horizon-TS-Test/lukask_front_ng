import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

@Component({
  selector: 'material-button',
  templateUrl: './material-button.component.html',
  styleUrls: ['./material-button.component.css']
})
export class MaterialButtonComponent implements OnInit {
  @Input() buttonMeta: HorizonButton;
  @Output() buttonAction: EventEmitter<number>;

  constructor() {
    this.buttonAction = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  requestAction(event: any) {
    event.preventDefault();
    this.buttonAction.emit(this.buttonMeta.action);
  }

}
