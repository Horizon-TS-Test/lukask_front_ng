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
  private isFetchedComments: boolean;

  public DEFAULT_LIMIT: number = 2;

  constructor(
    private _http: Http,
    private _userService: UserService
  ) {
    this.isFetchedComments = false;
  }

  private getCommentsWebByPub(parentId: string, isReplies: boolean, pagePattern: string = null, moreComments: boolean = false) {
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
      let filter = ((!isReplies) ? "/?pub_id=" + parentId : "/?com_id=" + parentId) + "&limit=" + this.DEFAULT_LIMIT + ((isReplies) ? "&replies=true" : "");

      return this._http.get(REST_SERV.commentUrl + filter, {
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
            if (isReplies) {
              console.log("[LUKASK QUEJA SERVICE] - REPLIES OF A COMMENT WITH ID " + parentId + " FROM WEB", comments);
            }
            else {
              console.log("[LUKASK QUEJA SERVICE] - COMMENTS OF A PUBLICATION WITH ID " + parentId + " FROM WEB", comments);
            }
            return { comments: comments, pagePattern: respJson.comments.next };
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
   * @param parentId 
   */
  private getCommentsCacheByPub(parentId: string) {
    return new Promise((resolve, reject) => {
      this.isFetchedComments = true;
      resolve(null);
    });
  }

  public getCommentByPub(parentId: string, isReplies: boolean, pagePattern: string = null) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getCommentsWebByPub(parentId, isReplies, pagePattern).then((webComments: any) => {

      if (!this.isFetchedComments) {
        return this.getCommentsCacheByPub(parentId).then((cacheComments: Comment[]) => {
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

  public getMoreCommentByPub(parentId: string, isReplies: boolean, pagePattern: string) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getCommentsWebByPub(parentId, isReplies, pagePattern, true).then((webComments: Comment[]) => {

      if (!this.isFetchedComments) {
        return this.getCommentsCacheByPub(parentId).then((cacheComments: Comment[]) => {
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

  /**
   * MÉTODO PARA GUARDAR UN COMENTARIO O UNA RESPUESTA A UN COMENTARIO:
   * @param comment EL COMENTARIO O RESPUESTA A ENVIAR
   */
  public sendComment(comment: Comment) {
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

  /**
   * 
   */
  public sendRelevance(pubId: string) {
    const requestHeaders = new Headers(
      {
        'Content-Type': 'application/json',
        'X-Access-Token': this._userService.getUserId()
      }
    );
    const requestBody = JSON.stringify({ id_publication: pubId });

    return this._http.post(REST_SERV.relevanceUrl, requestBody, { headers: requestHeaders, withCredentials: true })
      .toPromise()
      .then((response: Response) => {
        let respJson = response.json().data;

        return respJson;
      });
  }

  public extractCommentJson(jsonComment: any) {
    let usr = this._userService.extractUserJson(jsonComment.user_register);

    return new Comment(jsonComment.id_action, jsonComment.description, jsonComment.publication, usr, jsonComment.action_parent);
  }
}
