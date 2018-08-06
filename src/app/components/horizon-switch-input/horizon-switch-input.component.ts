import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'horizon-switch-input',
  templateUrl: './horizon-switch-input.component.html',
  styleUrls: ['./horizon-switch-input.component.css']
})
export class HorizonSwitchInputComponent implements OnInit {
  @Input() checkedInput: boolean;
  @Input() label: string;
  @Output() onChange: EventEmitter<boolean>;

  constructor() {
    this.onChange = new EventEmitter<boolean>();
  }

  ngOnInit() {
  }

  switchChange(event: any) {
    this.checkedInput = !this.checkedInput;
    this.onChange.emit(this.checkedInput);
  }

}
