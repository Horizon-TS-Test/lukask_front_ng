import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private _userService: UserService,
    private _router: Router
  ) { }

  canActivate() {
    if (this._userService.isLoggedIn()) {
      return true;
    }

    this._router.navigate(['/login']);
    return false;
  }

}
