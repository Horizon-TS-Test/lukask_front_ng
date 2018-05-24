import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private _loginService: LoginService,
    private _router: Router
  ) { }

  canActivate() {
    if (this._loginService.isLoggedIn()) {
      return true;
    }

    this._router.navigate(['/login']);
    return false;
  }

}
