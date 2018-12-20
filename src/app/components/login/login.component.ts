import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { LoginService } from '../../services/login.service';
import { ContentService } from '../../services/content.service';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';
import { Router } from '@angular/router';
import { CONTENT_TYPES } from '../../config/content-type';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { InstallPromptService } from 'src/app/services/install-prompt.service';
import { ScreenService } from 'src/app/services/screen.service';
import { UserService } from 'src/app/services/user.service';

declare var $: any;
declare var device: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public user: User;
  public contentTypes: any;
  public loadingClass: string;
  public activeClass: string;
  public isNative: boolean;

  constructor(
    private _loginService: LoginService,
    private _contentService: ContentService,
    private _dynaContentService: DynaContentService,
    private _installPromptService: InstallPromptService,
    private _screenService: ScreenService,
    private _userService: UserService,
    private _router: Router,
  ) {
    this.resetForm();
    this.contentTypes = CONTENT_TYPES;
  }

  ngOnInit() {
    this.isNativeApp();
    this._contentService.fadeInComponent($("#loginContainer"));
  }

  /**
   * METODO PARA DETECTAR SI EL APP ESTA DESPLEGADA EN FORMA DE APP MOVIL NATIVA:
   */
  private isNativeApp() {
    document.addEventListener("deviceready", () => {
      this.isNative = device.platform ? true : false;
    }, false);
  }

  /**
   * METODO PARA RESTABLECER EL OBJETO USUARIO QUE ES USADO EN EL FORMULARIO DE LOGIN:
   */
  private resetForm() {
    this.user = new User(null, null);
  }

  /**
   * METODO PARA ACTIVAR LA ANIMACIÓN DE LOADING:
   * @param remove 
   */
  private activeLoadingContent(remove: boolean = false) {
    if (remove) {
      this.loadingClass = "";
      this.activeClass = "";
    }
    else {
      this.loadingClass = "on";
      this.activeClass = "active";
    }
  }

  /**
   * METODO PARA INICIAR SESIÓN EN EL APP:
   */
  public onLogin() {
    this._installPromptService.openInstallPrompt();
    let alertData: Alert;
    this.activeLoadingContent();
    this._loginService.restLogin(this.user)
      .then(response => {
        $("#resetBtn").click();
        this.activeLoadingContent(true);
        this.resetForm();

        alertData = new Alert({ title: 'Mensaje del Sistema', message: "Te damos la bienvenida a LUKASK", type: ALERT_TYPES.info });
        this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.alert, contentData: alertData });

        this._screenService.defineScreenDelay(1500);
        this._router.navigateByUrl('/');
      })
      .catch((error: Response) => {
        const respJson: any = error.json();
        console.log("error", respJson);

        switch (respJson.code) {
          case 400:
            alertData = new Alert({ title: 'Proceso Fallido', message: "Las credenciales ingresadas son incorrectas", type: ALERT_TYPES.danger });
            break;
          case 500:
            alertData = new Alert({ title: 'Proceso Fallido', message: "Error inesperado en el servidor, lamentamos los inconvenientes", type: ALERT_TYPES.warning });
            break;
          case undefined:
            alertData = new Alert({ title: 'Proceso Fallido', message: "Se ha perdido la conexión con el servidor", type: ALERT_TYPES.danger });
            break;
        }

        $("#resetBtn").click();
        this.activeLoadingContent(true);
        this.resetForm();

        this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.alert, contentData: alertData });
      });
  }

  /**
 * METODO PARA SOLICITAR QUE SE INCRUSTE DINÁMICAMENTE UN HORIZON MODAL CON CIERTO CONTENIDO EN SU INTERIOR
 * @param event EVENTO CLICK DEL ELEMENTO <a href="#">
 * @param contType TIPO DE CONTENIDO A MOSTRAR DENTRO DEL HORIZON MODAL
 */
  public openLayer(event: any, contType: number) {
    event.preventDefault();
    this._installPromptService.openInstallPrompt();
    this._dynaContentService.loadDynaContent({ contentType: contType, contentData: "" });
  }
}