import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

@Component({
  selector: 'material-button',
  templateUrl: './material-button.component.html',
  styleUrls: ['./material-button.component.css']
})
export class MaterialButtonComponent implements OnInit, OnChanges {
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

  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'buttonMeta') {
        /*console.log('Previous:', changes[property].previousValue);
        console.log('Current:', changes[property].currentValue);
        console.log('firstChange:', changes[property].firstChange);*/

        if (changes[property].currentValue) {
          this.buttonMeta = <HorizonButton>changes[property].currentValue;
        }
      }
    }
  }
}
