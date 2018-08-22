import { Injectable } from '@angular/core';

declare var writeData: any;

@Injectable({
  providedIn: 'root'
})
export class BackSyncService {

  constructor() { }

  storeForBackSync(syncTable: string, syncProcName: string, data: any) {
    if (navigator.serviceWorker.controller) {
      return navigator.serviceWorker.ready
        .then((serviceW) => {
          console.log(serviceW);
          writeData(syncTable, data)
            .then(function () {
              serviceW.sync.register(syncProcName);
            })
            .then(function () {
              console.log("[LUKASK BACK SYNC SERVICE] - A new request has been saved for back syncing!!");
              return true;
            }).catch(function (err) {
              console.log(err);
            });
        });
    }
  }
}
