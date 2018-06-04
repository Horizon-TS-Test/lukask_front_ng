import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

@Component({
  selector: 'material-btn-list',
  templateUrl: './material-btn-list.component.html',
  styleUrls: ['./material-btn-list.component.css']
})
export class MaterialBtnListComponent implements OnInit {
  @Input() materialBtns: HorizonButton[];
  @Output() someBtnAction: EventEmitter<number>;

  constructor() {
    this.someBtnAction = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  childRequestAction(actionEvent: number) {
    this.someBtnAction.emit(actionEvent);
  }

}
