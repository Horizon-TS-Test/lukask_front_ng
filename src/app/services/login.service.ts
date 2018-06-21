import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';

//CHANGES IN: https://github.com/ReactiveX/rxjs
import { throwError } from 'rxjs';
/////

import { REST_SERV } from './../rest-url/rest-servers';

///////////FOR PASSWORD ENCRYPTION://////////////
import { CrytoGen } from './../tools/crypto-gen';
/////////////////////////////////////////////////

import { User } from '../models/user';
import { SocketService } from './socket.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private _http: Http,
    private _socketService: SocketService,
    private _userService: UserService
  ) { }

  restLogin(user: User) {
    let encUsr = CrytoGen.encrypt(user.username);
    let encPass = CrytoGen.encrypt(user.password);

    const requestHeaders = new Headers({ 'Content-Type': 'application/json' });
    const requestBody = JSON.stringify({ username: encUsr, password: encPass });

    return this._http.post(REST_SERV.loginUrl, requestBody, { headers: requestHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        let respJson = response.json();
        console.log(respJson);
        if (response.status === 200) {
          this._socketService.connectSocket();
          this._userService.storeUserCredentials(respJson.data);
        }
        return respJson;
      });
  }
}
