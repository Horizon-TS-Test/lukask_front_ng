import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Select2 } from '../../interfaces/select2.interface';

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
    $(".personal-select2").select2({
      theme: "bootstrap"
    });

    $('#' + this.fcName).select2({
      //dropdownParent: $('.horizon-modal')
    });

    //REF: https://stackoverflow.com/questions/17995057/prevent-select2-from-autmatically-focussing-its-search-input-when-dropdown-is-op
    $(".personal-select2").on('select2:open', (e) => {
      $('.select2-search input').prop('focus', false);

      $('.select2-search input').on("blur", function (e) {
        $('.select2-search').parent().removeClass('p-fixed-select2');
      });

      $('.select2-search input').on("focus", function (e) {
        if (e.originalEvent) {
          setTimeout(() => {
            $('.select2-search').parent().addClass('p-fixed-select2');
          }, 1000);
        }
      });
    });

  }

  ngAfterViewInit() {
    $("#" + this.fcName).on("change", (e) => {
      this.select2Change.emit($("#" + this.fcName).val());
    });
  }
}
