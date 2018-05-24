import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserNotifierService {

  constructor() { }

  displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
      let options: any = {
        body: 'You successfully subscribed to my site',
        icon: '/src/images/icons/app-icon-96x96.png',
        image: '/src/images/sf-boat.jpg',
        dir: 'ltr',
        lang: 'es-US', //BCP 47
        vibrate: [100, 50, 200], //THIS IS FOR SOME DEVICES NOT FOR ALL
        badge: '/src/images/icons/app-icon-96x96.png', //SHOW ON NOTIFICATION BAR
        //ADITIONAL OPTIONS:
        tag: 'confirm-notification', //TO ALLOW NOTIFICATIONS WILL STACK AND SHOW ONE GROUP OF NOTIFICATIONS
        renotify: false, //TO SPECIFY JUST ONE VIBRATION OF THE FIRST NOTIFICATION INCOMMING OF A GROUP OF NOTIFICATIONS
        actions: [ //THESE ARE THE OPTIONS DISPLAYED ON THE NOTIFICATION
          {
            action: 'confirm',
            title: "Oh yes!",
            icon: '/src/images/icons/app-icon-96x96.png'
          },
          {
            action: 'cancel',
            title: "Oh crap!",
            icon: '/src/images/icons/app-icon-96x96.png'
          }
        ]
      };

      navigator.serviceWorker.ready
        .then((swreg) => {
          swreg.showNotification('Successfully subscribed!', options);
        });
    }
  }
}
