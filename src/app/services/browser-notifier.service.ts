import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserNotifierService {

  constructor() { }

  /**
   * MÉTODO PARA MOSTRAR UNA NOTIFICACIÓN EN EL NAVEGADOR O EN EL MÓBIL:
   */
  public displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
      let options: any = {
        body: 'You successfully subscribed to my site',
        icon: '/assets/icons/lukask-96x96.png',
        dir: 'ltr',
        lang: 'es-US', //BCP 47
        vibrate: [500, 200, 200, 100], //THIS IS FOR SOME DEVICES NOT FOR ALL
        badge: '/assets/icons/lukask-96x96.png', //SHOW ON NOTIFICATION BAR
        //ADITIONAL OPTIONS:
        tag: 'confirm-notification', //TO ALLOW NOTIFICATIONS WILL STACK AND SHOW ONE GROUP OF NOTIFICATIONS
        renotify: false, //TO SPECIFY JUST ONE VIBRATION OF THE FIRST NOTIFICATION INCOMMING OF A GROUP OF NOTIFICATIONS
        actions: [ //THESE ARE THE OPTIONS DISPLAYED ON THE NOTIFICATION
          {
            action: 'confirm',
            title: "Oh yes!",
            //icon: '/assets/icons/lukask-96x96.png'
          },
          {
            action: 'cancel',
            title: "Oh crap!",
            //icon: '/assets/icons/lukask-96x96.png'
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
