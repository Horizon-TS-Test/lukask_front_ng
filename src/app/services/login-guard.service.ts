import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanActivate {

  constructor(
    private _loginService: LoginService,
    private _router: Router
  ) { }

  canActivate() {
    if (!this._loginService.isLoggedIn()) {
      return true;
    }

    this._router.navigate(['/inicio']);
    return false;
  }

}
