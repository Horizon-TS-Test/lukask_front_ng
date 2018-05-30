import { Component, OnInit, OnDestroy } from '@angular/core';

import { QuejaService } from '../../services/queja.service';
import { Publication } from '../../models/publications';
import { SocketService } from '../../services/socket.service';
import { UtilsService } from '../../services/utils.service';
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
  providers: [UtilsService]
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
    this._quejaService.getPubList().then((pubs: Publication[]) => {
      this.pubList = pubs;
    });
  }

  listenToSocket() {
    this.subsSocketPub = this._socketService._publicationUpdate.subscribe(
      (socketPub: any) => {
        let stream = socketPub.stream;
        let action = socketPub.payload.action.toUpperCase();

        switch (stream) {
          case "publication":
            let jsonPub = socketPub.payload.data;
            let lastPub: Publication, newPub: Publication;

            //STORING THE DATA COMMING FROM THE SOCKET.IO IN INDEXED-DB
            writeData('publication', jsonPub);
            ////

            //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
            lastPub = this.pubList.find(pub => pub.id_publication === jsonPub.id_publication);

            if (action != this._utilsService.DELETE) {
              newPub = this._quejaService.extractPubJson(jsonPub, true);
            }

            this._utilsService.backendServerSays(action, this.pubList, lastPub, newPub);
            break;
          case "multimedia":
            let jsonMedia = socketPub.payload.data;
            let lastMedia: Media, newMedia: Media;
            let ownerPub: Publication;

            //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
            ownerPub = this.pubList.find(pub => pub.id_publication === jsonMedia.id_publication);

            //deleteItemData('publication', )

            lastMedia = ownerPub.media.find(med => med.id === jsonMedia.id_multimedia);

            if (action != this._utilsService.DELETE) {
              newMedia = new Media(jsonMedia.id_multimedia, jsonMedia.format_multimedia, REST_SERV.mediaBack + jsonMedia.media_file, null, null, null, jsonMedia.id_publication);
            }

            this._utilsService.backendServerSays(action, ownerPub.media, lastMedia, newMedia);
            break;
        }
      }
    );
  }

  ngOnDestroy() {
    this.subsSocketPub.unsubscribe();
  }

}