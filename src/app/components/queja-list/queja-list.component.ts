import { Component, OnInit, OnDestroy } from '@angular/core';

import { QuejaService } from '../../services/queja.service';
import { Publication } from '../../models/publications';
import { SocketService } from '../../services/socket.service';
import { UtilsService } from '../../services/utils.service';
import { Subscription } from 'rxjs';

declare var utilityDb: any;

@Component({
  selector: 'app-quejas-list',
  templateUrl: './queja-list.component.html',
  styleUrls: ['./queja-list.component.css'],
  providers: [QuejaService, UtilsService]
})
export class QuejaListComponent implements OnInit, OnDestroy {
  public pubList: Publication[];

  private subsSocketPub: Subscription;

  constructor(
    private _quejaService: QuejaService,
    private _socketService: SocketService,
    private _utilsService: UtilsService
  ) {
    this.getPubList();
    this.listenToSocket();
  }

  ngOnInit() {
  }

  getPubList() {
    this._quejaService.getPubList().then((pubs) => {
      this.pubList = pubs;
    });
  }

  listenToSocket() {
    this.subsSocketPub = this._socketService._publicationUpdate.subscribe(
      (socketPub: any) => {
        console.log(socketPub);

        let jsonPub = socketPub.data;
        console.log("[Queja List]", jsonPub);
        let action = socketPub.action.toUpperCase();
        let lastPub: Publication, newPub: Publication;

        //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
        lastPub = this.pubList.find(pub => pub.id_publication === jsonPub.id_publication);

        if (action != this._utilsService.DELETE) {
          newPub = new Publication(jsonPub.id_publication, jsonPub.latitude, jsonPub.longitude, jsonPub.detail, jsonPub.date_publication, jsonPub.priority_publication, jsonPub.active, jsonPub.type_publication);
        }

        this.pubList = this._utilsService.backendServerSays(action, this.pubList, lastPub, newPub);
        this._quejaService.setPubList(this.pubList);

        console.log(this.pubList);
      }
    );
  }

  ngOnDestroy() {
    this.subsSocketPub.unsubscribe();
  }

}