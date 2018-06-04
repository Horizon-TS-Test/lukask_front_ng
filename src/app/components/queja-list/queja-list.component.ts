import { Component, OnInit, OnDestroy } from '@angular/core';

import { QuejaService } from '../../services/queja.service';
import { Publication } from '../../models/publications';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user';
import { REST_SERV } from '../../rest-url/rest-servers';
import { Media } from '../../models/media';

declare var writeData: any;
declare var deleteItemData: any;

@Component({
  selector: 'app-quejas-list',
  templateUrl: './queja-list.component.html',
  styleUrls: ['./queja-list.component.css'],
})
export class QuejaListComponent implements OnInit {
  public pubList: Publication[];

  constructor(
    private _quejaService: QuejaService,
    private _socketService: SocketService
  ) {
    this.getPubList();
  }

  ngOnInit() {
  }

  getPubList() {
    this._quejaService.getPubList().then((pubs: Publication[]) => {
      this.pubList = pubs;
    });
  }

}