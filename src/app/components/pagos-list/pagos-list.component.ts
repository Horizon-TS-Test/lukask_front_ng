import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuejaService } from '../../services/queja.service';
import { Publication } from '../../models/publications';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-pagos-list',
  templateUrl: './pagos-list.component.html',
  styleUrls: ['./pagos-list.component.css']
})
export class PagosListComponent implements OnInit {
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  private subscriptor: Subscription;

  public pubList: Publication[];
  public activeClass: string;

  constructor(
     private _notifierService: NotifierService
  ) {
    this.activeClass = this.LOADER_HIDE;
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}


