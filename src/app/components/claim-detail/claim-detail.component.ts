import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EersaClaim } from 'src/app/models/eersa-claim';

@Component({
  selector: 'claim-detail',
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.css']
})
export class ClaimDetailComponent implements OnInit {
  @Output() onEersaClaim: EventEmitter<EersaClaim>;

  constructor() {
    this.onEersaClaim = new EventEmitter<EersaClaim>();
  }

  ngOnInit() {
  }

}
