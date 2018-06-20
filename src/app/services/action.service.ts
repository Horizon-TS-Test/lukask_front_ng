import { Injectable } from '@angular/core';
import { Comment } from '../models/comment';
import { Headers, Http, Response } from '@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { throwError } from 'rxjs';
import { UserService } from './user.service';
import * as lodash from 'lodash';

declare var readAllData: any;
declare var upgradeTableFieldData: any;

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private isFetchedComments: boolean;

  private DEFAULT_LIMIT: number = 2;
  public MOBILE_LIMIT: number = 5;
  public pageLimit: number;

  constructor(
    private _http: Http,
    private _userService: UserService
  ) {
    this.isFetchedComments = false;
    this.pageLimit = this.DEFAULT_LIMIT;
  }

  /**
   * MÉTODO PARA OBTENER LOS COMENTARIOS DE UNA PUBLICACIÓN CON FILTRO DE PÁGINA DE LA WEB.
   * MÉTODO PARA OBTENER LAS RESPUESTAS DE UN COMENTARIO CON FILTRO DE PÁGINA DE LA WEB.
   * @param parentId ID DE PUBLICACIÓN / COMENTARIO
   * @param isReplies SI SE TRATA DE OBTENER RESPUESTAS DE UN COMENTARIO
   * @param pagePattern PATTERN DE PAGINACIÓN
   * @param moreComments PETICIÓN BAJO DEMANDA
   */
  private getCommentsWebByPub(parentId: string, isReplies: boolean, pagePattern: string = null, moreComments: boolean = false) {
    const requestHeaders = new Headers({
      "Content-Type": "application/json",
      'X-Access-Token': this._userService.getUserId()
    });
    let flag = true;

    if (moreComments && !pagePattern) {
      flag = false;
    }

    if (flag) {
      let filter = ((!isReplies) ? "/?pub_id=" + parentId : "/?com_id=" + parentId) + ((pagePattern) ? pagePattern : "&limit=" + this.pageLimit) + ((isReplies) ? "&replies=true" : "");

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
        })
        .catch((error: Response) => {
          if (error.json().code == 401) {
            localStorage.clear();
          }
          return throwError(error.json());
        });
    }
    return new Promise((resolve, reject) => {
      this.isFetchedComments = true;
      resolve(null);
    });
  }

  /**
   * MÉTODO PARA OBTENER LOS COMENTARIOS DE UNA PUBLICACIÓN CON FILTRO DE PÁGINA DE LA CACHE.
   * MÉTODO PARA OBTENER LAS RESPUESTAS DE UN COMENTARIO CON FILTRO DE PÁGINA DE LA CACHE.
   * @param parentId ID DE PUBLICACIÓN / COMENTARIO
   * @param isReplies SI SE TRATA DE OBTENER RESPUESTAS DE UN COMENTARIO
   * @param pagePattern PATTERN DE PAGINACIÓN
   * @param moreComments PETICIÓN BAJO DEMANDA
   */
  private getCommentsCacheByPub(parentId: string, isReplies: boolean, pagePattern: string = null) {
    if ('indexedDB' in window) {
      return readAllData((isReplies) ? 'reply' : 'comment')
        .then((tableData) => {
          let comments: Comment[] = [];
          ////
          let offset = 0;
          if (pagePattern) {
            offset = parseInt(pagePattern.substring(pagePattern.indexOf("=", pagePattern.indexOf("offset")) + 1));
          }
          let cont = 0;
          for (let i = 0; i < tableData.length; i++) {
            if (parentId == tableData[i].id) {
              //REF: https://www.npmjs.com/package/lodash
              //REF: https://stackoverflow.com/questions/43371092/use-lodash-to-sort-array-of-object-by-value
              let sortedData = lodash.orderBy(((isReplies) ? tableData[i].replies : tableData[i].comments), ['date_register'], ['desc']);
              ////
              for (let d = 0; d < sortedData.length; d++) {
                if (d >= offset && cont < this.pageLimit) {
                  comments.push(this.extractCommentJson(sortedData[d]));
                  cont++;
                }
              }

              let size = sortedData.length;
              offset = (offset + this.pageLimit < size) ? offset + this.pageLimit : null;

              i = tableData.length;
            }
          }

          if (isReplies) {
            console.log("[LUKASK QUEJA SERVICE] - REPLIES OF A COMMENT WITH ID " + parentId + " FROM CACHE", comments);
          }
          else {
            console.log("[LUKASK QUEJA SERVICE] - COMMENTS OF A PUBLICATION WITH ID " + parentId + " FROM CACHE", comments);
          }

          return { comments: comments, pagePattern: (offset) ? "&limit=" + this.pageLimit + "&offset=" + offset : null };
        });
    }

    return new Promise((resolve, reject) => {
      this.isFetchedComments = true;
      resolve(null);
    });
  }

  /**
   * MÉTODO PARA OBTENER COMENTARIOS/RESPUESTAS SEA DE LA WEB O DE LA CACHÉ
   * @param parentId ID DE PUBLICACIÓN / COMENTARIO
   * @param isReplies SI SE TRATA DE OBTENER RESPUESTAS DE UN COMENTARIO
   * @param pagePattern PATTERN DE PAGINACIÓN
   */
  public getCommentByPub(parentId: string, isReplies: boolean, pagePattern: string = null) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getCommentsWebByPub(parentId, isReplies, pagePattern).then((webComments: any) => {

      if (!this.isFetchedComments) {
        return this.getCommentsCacheByPub(parentId, isReplies).then((cacheComments: any) => {
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
   * MÉTODO PARA CARGAR LOS COMENTARIOS O RESPUESTAS SEA DE LA WEB O DE LA CACHÉ:
   * @param parentId ID DE PUBLICACIÓN / COMENTARIO
   * @param isReplies SI SE TRATA DE OBTENER RESPUESTAS DE UN COMENTARIO
   * @param pagePattern PATTERN DE PAGINACIÓN
   */
  public getMoreCommentByPub(parentId: string, isReplies: boolean, pagePattern: string) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getCommentsWebByPub(parentId, isReplies, pagePattern, true).then((webComments: Comment[]) => {

      if (!this.isFetchedComments) {
        return this.getCommentsCacheByPub(parentId, isReplies, pagePattern).then((cacheComments: Comment[]) => {
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
    const requestBody = JSON.stringify({
      description: comment.description,
      id_publication: comment.publicationId,
      action_parent: (comment.commentParentId) ? comment.commentParentId : "",
      active: true
    });

    return this._http.post(REST_SERV.commentUrl, requestBody, { headers: requestHeaders, withCredentials: true })
      .toPromise()
      .then((response: Response) => {
        let respJson = response.json().comment;

        console.log(respJson);
        upgradeTableFieldData(((comment.commentParentId) ? "reply" : "comment"), respJson, false);

        return respJson;
      })
      .catch((error) => throwError(error));
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO REGISTRO DE APOYO A UNA PUBLICACIÓN:
   */
  public sendRelevance(pubId: string, isRelevance: boolean) {
    const requestHeaders = new Headers(
      {
        'Content-Type': 'application/json',
        'X-Access-Token': this._userService.getUserId()
      }
    );
    const requestBody = JSON.stringify({
      id_publication: pubId,
      active: isRelevance
    });

    return this._http.post(REST_SERV.relevanceUrl, requestBody, { headers: requestHeaders, withCredentials: true })
      .toPromise()
      .then((response: Response) => {
        let respJson = response.json().relevanceData.active;

        return respJson;
      });
  }

  /**
   * MÉTODO PARA EXTRAER LOS DATOS DE UN NUEVO COMENTARIO Y CONVERTIRLO A UN OBJETO DE TIPO MODELO:
   * @param jsonComment 
   */
  public extractCommentJson(jsonComment: any) {
    let usr = this._userService.extractUserJson(jsonComment.user_register);

    return new Comment(jsonComment.id_action, jsonComment.description, jsonComment.publication, usr, jsonComment.action_parent);
  }
}
