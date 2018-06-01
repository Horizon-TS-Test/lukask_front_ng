import { Component, OnInit, ViewChild, ViewContainerRef, ContentChild, Output, EventEmitter } from '@angular/core';
import { User } from '../../models/user';
import { LoginService } from '../../services/login.service';
import { ContentService } from '../../services/content.service';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import { AlertComponent } from '../alert/alert.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from '../../services/notifier.service';

declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private alertData: Alert;

  public user: User;

  constructor(
    private _loginService: LoginService,
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
  ) {
    this.resetForm();
  }

  ngOnInit() {
    this._contentService.fadeInComponent();
  }

  resetForm() {
    this.user = new User(null, null);
  }

  activeLoadingContent(remove: boolean = false) {
    if (remove) {
      $("#loading-content").removeClass("active");
    }
    else {
      $("#loading-content").addClass("active");
    }
  }

  onLogin() {
    this.activeLoadingContent();
    this._loginService.restLogin(this.user)
      .then(
        response => {
          console.log(response);
          localStorage.setItem('user_id', response.data.user_id);
          localStorage.setItem('user_name', response.data.username);

          $("#resetBtn").click();
          this.activeLoadingContent(true);
          this.resetForm();

          this.alertData = new Alert({ title: 'Proceso Correcto', message: response.title, type: ALERT_TYPES.success });
          this.setAlert();

          this._router.navigateByUrl('/inicio');
        }
      ).catch((err) => {
        console.log("error", err);

        $("#resetBtn").click();
        this.activeLoadingContent(true);
        this.resetForm();

        this.alertData = new Alert({ title: 'Proceso Fallido', message: err.title, type: ALERT_TYPES.danger });
        this.setAlert();
      });
  }

  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

}