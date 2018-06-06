import { Injectable } from '@angular/core';
import { Comment } from '../models/comment';
import { Headers, Http, Response } from '@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { throwError } from 'rxjs';
import { error } from '@angular/compiler/src/util';
import { User } from '../models/user';
import { Person } from '../models/person';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private replyList: Comment[];
  private isFetchedComments: boolean;

  public DEFAULT_LIMIT: number = 2;

  constructor(
    private _http: Http,
    private _userService: UserService
  ) {
    this.isFetchedComments = false;

    this.replyList = [
      new Comment("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "", new User("stroker@mail.com", "", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6HJFHBLjKtKNOWiHnATky2_fhLKAnFe7wa8AcsjCLQ-hEObA1ow")),
      new Comment("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "", new User("stroker@mail.com", "", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6HJFHBLjKtKNOWiHnATky2_fhLKAnFe7wa8AcsjCLQ-hEObA1ow"))
    ];
  }

  getCommentsWebByPub(pubId: string, pagePattern: string = null, moreComments: boolean = false) {
    const requestHeaders = new Headers({
      "Content-Type": "application/json",
      'X-Access-Token': this._userService.getUserId(),
      'Page-Pattern': pagePattern
    });
    let flag = true;

    if (moreComments && !pagePattern) {
      flag = false;
    }

    if (flag) {
      return this._http.get(REST_SERV.commentUrl + "/?pub_id=" + pubId + "&limit=" + this.DEFAULT_LIMIT, {
        headers: requestHeaders,
        withCredentials: true
      }).toPromise()
        .then((response: Response) => {
          const respJson = response.json();
          if (response.status == 200) {
            let jsonComments = respJson.comments.results;
            let comments: Comment[] = [];
            for (let com of jsonComments) {
              comments.push(this.extractCommentJson(com));
            }

            this.isFetchedComments = true;
            console.log("[LUKASK QUEJA SERVICE] - COMMENTS OF A PUBLICATION WITH ID " + pubId + " FROM WEB", comments);
            return {comments: comments, pagePattern: respJson.comments.next};
          }
        });
    }

    return new Promise((resolve, reject) => {
      this.isFetchedComments = true;
      resolve(null);
    });
  }

  /**
   * COMPLETAR LA CARGA DE COMENTARIOS DESDE CACHÉ
   * @param pubId 
   */
  getCommentsCacheByPub(pubId: string) {
    return new Promise((resolve, reject) => {
      this.isFetchedComments = true;
      resolve(null);
    });
  }

  getCommentByPub(pubId: string, pagePattern: string = null) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getCommentsWebByPub(pubId, pagePattern).then((webComments: any) => {

      if (!this.isFetchedComments) {
        return this.getCommentsCacheByPub(pubId).then((cacheComments: Comment[]) => {
          return cacheComments;
        });
      }
      else {
        this.isFetchedComments = false;
      }

      return webComments;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }

  getMoreCommentByPub(pubId: string, pagePattern: string) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getCommentsWebByPub(pubId, pagePattern, true).then((webComments: Comment[]) => {

      if (!this.isFetchedComments) {
        return this.getCommentsCacheByPub(pubId).then((cacheComments: Comment[]) => {
          return cacheComments;
        });
      }
      else {
        this.isFetchedComments = false;
      }

      return webComments;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }

  sendComment(comment: Comment) {
    const requestHeaders = new Headers(
      {
        'Content-Type': 'application/json',
        'X-Access-Token': this._userService.getUserId()
      }
    );
    const requestBody = JSON.stringify({ description: comment.description, id_publication: comment.publicationId, action_parent: (comment.commentParentId) ? comment.commentParentId : "" });

    return this._http.post(REST_SERV.commentUrl, requestBody, { headers: requestHeaders, withCredentials: true })
      .toPromise()
      .then((response: Response) => {
        let respJson = response.json().comment;

        return respJson;
      })
      .catch((error) => throwError(error.json()));
  }

  getReplyListObj() {
    return this.replyList;
  }

  extractCommentJson(jsonComment: any) {
    let usr = this._userService.extractUserJson(jsonComment.user_register);

    return new Comment(jsonComment.id_action, jsonComment.description, jsonComment.publication, usr, jsonComment.action_parent);
  }
}
