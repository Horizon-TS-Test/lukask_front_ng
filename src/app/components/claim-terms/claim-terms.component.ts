import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'claim-terms',
  templateUrl: './claim-terms.component.html',
  styleUrls: ['./claim-terms.component.css']
})
export class ClaimTermsComponent implements OnInit {
  @Input() selectedCause: string;

  constructor() { }

  ngOnInit() {
  }

}
