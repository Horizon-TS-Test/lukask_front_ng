import { Component, OnInit, OnDestroy } from '@angular/core';
import { Publication } from '../../models/publications';

@Component({
  selector: 'app-pagos-list',
  templateUrl: './pagos-list.component.html',
  styleUrls: ['./pagos-list.component.css']
})
export class PagosListComponent implements OnInit {
  private LOADER_HIDE: string = "hide";
  public pubList: Publication[];
  public activeClass: string;

  constructor(
  ) {
    this.activeClass = this.LOADER_HIDE;
  }

  ngOnInit() { }

}


