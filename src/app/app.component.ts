import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { LoginService } from './services/login.service';
import { ContentService } from './services/content.service';
import { NotifierService } from './services/notifier.service';
import { AlertComponent } from './components/alert/alert.component';
import { Subscription } from 'rxjs';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  @ViewChild('alert_parent', { read: ViewContainerRef }) alertContainer: ViewContainerRef;

  public isLoggedIn: boolean;
  private subscription: Subscription;

  constructor(
    private _loginService: LoginService,
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _socketService: SocketService,
    private _cfr: ComponentFactoryResolver,
  ) {
    this.checkLogin();
    if (this.isLoggedIn) {
      this._socketService.connectSocket();
    }

    this.subscription = this._notifierService.listenAlert().subscribe(
      (alertData: any) => {
        this.checkLogin();
        this._contentService.addComponent(AlertComponent, this._cfr, this.alertContainer, this._contentService.ALERT_COMPONENT, alertData);
      }
    );
  }

  checkLogin() {
    //this.isLoggedIn = true;
    this.isLoggedIn = this._loginService.isLoggedIn();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
