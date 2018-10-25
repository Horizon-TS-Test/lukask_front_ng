import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class StreamGuardService implements CanActivate {

  constructor(
    private _userService: UserService,
    private _router: Router
  ) { }

  canActivate() {
    if (this._userService.isLoggedIn()) {
      if (this._userService.onStreaming) {
        return true;
      }

      console.log("Not working properly");
      this._router.navigate(['/']);
    }
    else {
      this._router.navigate(['/login']);
    }

    return false;
  }

}
