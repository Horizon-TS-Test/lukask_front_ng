import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { LoginService } from '../../services/login.service';
import { ContentService } from '../../services/content.service';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import { Router } from '@angular/router';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';

declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private alertData: Alert;

  public user: User;
  public contentTypes: any;
  public loadingClass: string;
  public activeClass: string;

  constructor(
    private _loginService: LoginService,
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _router: Router,
  ) {
    this.resetForm();
    this.contentTypes = CONTENT_TYPES;
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#loginContainer"));
  }

  resetForm() {
    this.user = new User(null, null);
  }

  activeLoadingContent(remove: boolean = false) {
    if (remove) {
      this.loadingClass = "";
      this.activeClass = "";
    }
    else {
      this.loadingClass = "on";
      this.activeClass = "active";
    }
  }

  onLogin() {
    this.activeLoadingContent();
    this._loginService.restLogin(this.user)
      .then(response => {
        $("#resetBtn").click();
        this.activeLoadingContent(true);
        this.resetForm();

        this.alertData = new Alert({ title: 'Proceso Correcto', message: "Bienvenido a LUKASK", type: ALERT_TYPES.success });
        this.setAlert();

        this._router.navigateByUrl('/inicio');
      })
      .catch((error: Response) => {
        const respJson: any = error.json();
        console.log("error", respJson);

        $("#resetBtn").click();
        this.activeLoadingContent(true);
        this.resetForm();

        this.alertData = new Alert({ title: 'Proceso Fallido', message: "Las credenciales ingesadas son incorrectas", type: ALERT_TYPES.danger });
        this.setAlert();
      });
  }

  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  /**
 * MÉTODO PARA SOLICITAR QUE SE INCRUSTE DINÁMICAMENTE UN HORIZON MODAL CON CIERTO CONTENIDO EN SU INTERIOR
 * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
 * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
 */
  openLayer(event: any, contType: number) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: contType, contentData: "" });
  }
}