import { Injectable } from '@angular/core';
import { Comment } from '../models/comment';
import { Headers, Http, Response } from '@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { throwError } from 'rxjs';
import { error } from '@angular/compiler/src/util';
import { LoginService } from './login.service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private commentList: Comment[];
  private replyList: Comment[];

  constructor(
    private _http: Http,
    private _loginService: LoginService
  ) {
    this.commentList = [
      new Comment("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "", new User("stroker@mail.com", "", "https://smhttp-ssl-33667.nexcesscdn.net/manual/wp-content/uploads/2016/05/mens-beard-styling-guide-1-1170x580.jpg")),
      new Comment("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "", new User("stroker@mail.com", "", "https://smhttp-ssl-33667.nexcesscdn.net/manual/wp-content/uploads/2016/05/mens-beard-styling-guide-1-1170x580.jpg"))
    ];

    this.replyList = [
      new Comment("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "", new User("stroker@mail.com", "", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6HJFHBLjKtKNOWiHnATky2_fhLKAnFe7wa8AcsjCLQ-hEObA1ow")),
      new Comment("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "", new User("stroker@mail.com", "", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6HJFHBLjKtKNOWiHnATky2_fhLKAnFe7wa8AcsjCLQ-hEObA1ow"))
    ];
  }

  sendComment(comment: Comment) {
    const requestHeaders = new Headers(
      {
        'Content-Type': 'application/json',
        'X-Access-Token': this._loginService.getUserId()
      }
    );
    const requestBody = JSON.stringify({ description: comment.description, id_publication: comment.id_publication });

    return this._http.post(REST_SERV.commentUrl, requestBody, { headers: requestHeaders, withCredentials: true })
      .toPromise()
      .then((response: Response) => {
        let respJson = response.json().comment;

        return respJson;
      })
      .catch((error) => throwError(error.json()));
  }

  getCommentListObj() {
    return this.commentList;
  }

  getReplyListObj() {
    return this.replyList;
  }
}
