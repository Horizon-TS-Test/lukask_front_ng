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

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl: string;

  constructor(
    private _http: Http,
    private _socketService: SocketService,
  ) {
    this.loginUrl = REST_SERV.loginUrl;
  }

  restLogin(user: User) {
    let encUsr = CrytoGen.encrypt(user.username);
    let encPass = CrytoGen.encrypt(user.password);

    const userBody = JSON.stringify({ username: encUsr, password: encPass });
    const userHeaders = new Headers({ 'Content-Type': 'application/json' });

    return this._http.post(this.loginUrl, userBody, { headers: userHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        let respJson = response.json();
        console.log(respJson);
        if (respJson.code == 200) {
          this._socketService.connectSocket();
        }
        return respJson;
      }).catch((error: Response) => throwError(error.json()));
  }

  isLoggedIn() {
    return localStorage.getItem('user_id') !== null;
  }

  getUserId() {
    const user_id = localStorage.getItem("user_id") ? localStorage.getItem("user_id") : '';
    return user_id;
  }
}
