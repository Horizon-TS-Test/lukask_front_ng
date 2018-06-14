import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanActivate {

  constructor(
    private _userService: UserService,
    private _router: Router
  ) { }

  canActivate() {
    if (!this._userService.isLoggedIn()) {
      return true;
    }

    this._router.navigate(['/inicio']);
    return false;
  }

}
