import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

/*platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));*/

//https://stackoverflow.com/questions/50968902/angular-service-worker-swupdate-available-not-triggered#
platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    if ('serviceWorker' in navigator && environment.production) {
      console.log("[MAIN.JS] - REGISTERING NEW SERVICE WORKER");

      navigator.serviceWorker.register('/sw-workbox.js').then((reg) => {
        reg.addEventListener('updatefound', () => {

          // An updated service worker has appeared in reg.installing!
          let newWorker = reg.installing;

          newWorker.addEventListener('statechange', () => {

            // Has service worker state changed?
            switch (newWorker.state) {
              case 'installed':
                // There is a new service worker available, show the notification
                if (navigator.serviceWorker.controller) {
                  console.log("[MAIN.JS] - NEW UPDATE PENDING TO BE APLYED");

                  let channel = new BroadcastChannel('lets-update');
                  channel.postMessage({ askForUpdate: true });
                }
                break;
            }
          });
        });
      });
    }
  }).catch(err => console.log(err));