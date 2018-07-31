import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Select2 } from '../../interfaces/select2.interface';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-select2-bootstrap',
  templateUrl: './select2-bootstrap.component.html',
  styleUrls: ['./select2-bootstrap.component.css']
})
export class Select2BootstrapComponent implements OnInit, AfterViewInit {
  @Input() select2Data: Select2[];
  @Input() fcName: string;

  @Output() select2Change: EventEmitter<string>;

  constructor() {
    this.select2Change = new EventEmitter<string>();
  }

  ngOnInit() {
    $(".js-example-basic-single").select2({
      theme: "bootstrap"
    });
    
  }

  ngAfterViewInit() {
    $("#" + this.fcName).on("change", (e) => {
      this.select2Change.emit($("#" + this.fcName).val());
    });
  }
}
