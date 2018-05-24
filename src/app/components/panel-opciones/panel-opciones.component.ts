import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { SubscribeService } from '../../services/subscribe.service';

declare var $: any;

@Component({
  selector: 'app-panel-opciones',
  templateUrl: './panel-opciones.component.html',
  styleUrls: ['./panel-opciones.component.css']
})
export class PanelOpcionesComponent implements OnInit {
  public contentTypes: any;
  public isAble: boolean;

  constructor(
    private _loginService: LoginService,
    private _notifierService: NotifierService,
    private _subscribeService: SubscribeService,
  ) {
    this.contentTypes = CONTENT_TYPES;
  }

  ngOnInit() {
    this.isAbleToSubscribe();
  }

  isAbleToSubscribe() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      this.isAble = true;
    }
    else {
      this.isAble = false;
    }
  }

  openLayer(event: any, contentType: number) {
    event.preventDefault();
    this._notifierService.notifyNewContent(contentType);
  }

  subscribe(event: any) {
    event.preventDefault();
    this._subscribeService.askForSubscription();
  }

}
