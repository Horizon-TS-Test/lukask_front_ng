import { Injectable } from '@angular/core';
import { Comment } from '../models/comment';
import { Headers, Http, Response } from '@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { throwError, Observable, BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { BackSyncService } from './back-sync.service';
import { DateManager } from '../tools/date-manager';
import * as lodash from 'lodash';
import { ArrayManager } from '../tools/array-manager';

declare var readAllData: any;
declare var deleteItemData: any;
declare var upgradeTableFieldData: any;

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private isFetchedComments: boolean;
  private isPostedComment: boolean;
  private isPostedRelevance: boolean;

  public DEFAULT_LIMIT: number = 2;
  public MOBILE_LIMIT: number = 5;

  private commSubject = new BehaviorSubject<{ comments: Comment[]; pagePattern: string }>(null);
  comms$: Observable<{ comments: Comment[]; pagePattern: string }> = this.commSubject.asObservable();

  private replySubject = new BehaviorSubject<{ comments: Comment[]; pagePattern: string }>(null);
  replies$: Observable<{ comments: Comment[]; pagePattern: string }> = this.replySubject.asObservable();

  constructor(
    private _http: Http,
    private _userService: UserService,
    private _backSyncService: BackSyncService
  ) {
    this.isFetchedComments = false;
    this.isPostedComment = false;
    this.isPostedRelevance = false;
  }

  /**
   * MÉTODO PARA ENVIAR LA ACTUALIZACIÓN DE LA LISTA DE COMENTARIOS:
   * @param comList
   */
  public loadComments(comList: { comments: Comment[]; pagePattern: string }) {
    this.commSubject.next(comList);
  }

  /**
   * MÉTODO PARA CAMBIAR EL ESTADO DE UN COMENTARIO CUANDO SE HA DADO APOYO EN MODO OFFLINE:
   */
  public changeComOffRelevance(offRelCom: Comment, commList: Comment[], pagePattern: string) {
    let currentCom = commList.find(currCom => currCom.commentId === offRelCom.commentId);
    ArrayManager.backendServerSays("UPDATE", commList, currentCom, offRelCom);
    this.loadComments({ comments: commList, pagePattern: pagePattern });
  }

  /**
   * MÉTODO PARA ENVIAR LA ACTUALIZACIÓN DE LA LISTA DE COMENTARIOS:
   * @param comList
   */
  public loadReplies(replyList: { comments: Comment[]; pagePattern: string }) {
    this.replySubject.next(replyList);
  }

  /**
   * MÉTODO PARA OBTENER LOS COMENTARIOS DE UNA PUBLICACIÓN CON FILTRO DE PÁGINA DE LA WEB.
   * MÉTODO PARA OBTENER LAS RESPUESTAS DE UN COMENTARIO CON FILTRO DE PÁGINA DE LA WEB.
   * @param parentId ID DE PUBLICACIÓN / COMENTARIO
   * @param isReplies SI SE TRATA DE OBTENER RESPUESTAS DE UN COMENTARIO
   * @param pagePattern PATTERN DE PAGINACIÓN
   * @param moreComments PETICIÓN BAJO DEMANDA
   */
  private getCommentsWebByPub(parentId: string, isReplies: boolean, pagePattern: string = null, pageLimit: number = this.DEFAULT_LIMIT, moreComments: boolean = false) {
    const requestHeaders = new Headers({
      "Content-Type": "application/json",
      'X-Access-Token': this._userService.getUserKey()
    });
    let flag = true;

    if (moreComments == true && !pagePattern) {
      flag = false;
    }

    if (flag) {
      let filter = ((!isReplies) ? "/?pub_id=" + parentId : "/?com_id=" + parentId) + ((pagePattern && moreComments == true) ? pagePattern : "&limit=" + pageLimit) + ((isReplies) ? "&replies=true" : "");

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
              console.log("[LUKASK ACTION SERVICE] - REPLIES OF A COMMENT WITH ID " + parentId + " FROM WEB", comments);
            }
            else {
              console.log("[LUKASK ACTION SERVICE] - COMMENTS OF A PUBLICATION WITH ID " + parentId + " FROM WEB", comments);
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
  private getCommentsCacheByPub(parentId: string, isReplies: boolean, pageLimit: number = this.DEFAULT_LIMIT, pagePattern: string = null) {
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
                if (d >= offset && cont < pageLimit) {
                  comments.push(this.extractCommentJson(sortedData[d]));
                  cont++;
                }
              }

              let size = sortedData.length;
              offset = (offset + pageLimit < size) ? offset + pageLimit : null;

              i = tableData.length;
            }
          }

          if (isReplies) {
            console.log("[LUKASK ACTION SERVICE] - REPLIES OF A COMMENT WITH ID " + parentId + " FROM CACHE", comments);
          }
          else {
            console.log("[LUKASK ACTION SERVICE] - COMMENTS OF A PUBLICATION WITH ID " + parentId + " FROM CACHE", comments);
          }

          return { comments: comments, pagePattern: (offset) ? "&limit=" + pageLimit + "&offset=" + offset : null };
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
  public getCommentByPub(parentId: string, isReplies: boolean, pageLimit: number = this.DEFAULT_LIMIT, pagePattern: string = null) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getCommentsWebByPub(parentId, isReplies, pagePattern, pageLimit).then((webComments: any) => {

      if (!this.isFetchedComments) {
        return this.getCommentsCacheByPub(parentId, isReplies, pageLimit).then((cacheComments: any) => {
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
      //return throwError(error);
    });
  }

  /**
   * MÉTODO PARA CARGAR LOS COMENTARIOS O RESPUESTAS SEA DE LA WEB O DE LA CACHÉ:
   * @param parentId ID DE PUBLICACIÓN / COMENTARIO
   * @param isReplies SI SE TRATA DE OBTENER RESPUESTAS DE UN COMENTARIO
   * @param pagePattern PATTERN DE PAGINACIÓN
   */
  public getMoreCommentByPub(parentId: string, isReplies: boolean, pagePattern: string, pageLimit: number = this.DEFAULT_LIMIT) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getCommentsWebByPub(parentId, isReplies, pagePattern, pageLimit, true).then((webComments: Comment[]) => {

      if (!this.isFetchedComments) {
        return this.getCommentsCacheByPub(parentId, isReplies, pageLimit, pagePattern).then((cacheComments: Comment[]) => {
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
        'X-Access-Token': this._userService.getUserKey()
      }
    );
    const requestBody = JSON.stringify({
      description: comment.description,
      id_publication: comment.publicationId,
      action_parent: (comment.commentParentId) ? comment.commentParentId : "",
      date: comment.dateRegister,
      active: true,
      userId: this._userService.getUserProfile().id,
      userName: this._userService.getUserProfile().person.name,
      userImage: this._userService.getUserProfile().profileImg
    });

    return this._http.post(REST_SERV.commentUrl, requestBody, { headers: requestHeaders, withCredentials: true })
      .toPromise()
      .then((response: Response) => {
        let respJson = response.json().data;

        upgradeTableFieldData(((comment.commentParentId) ? "reply" : "comment"), respJson, false);

        this.isPostedComment = true;
        return respJson;
      })
      .catch((error) => throwError(error));
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO COMENTARIO O RESPUESTA EN EL BACKEND O EN SU DEFECTO PARA BACK SYNC:
   */
  public saveComment(comment: Comment) {
    return this.sendComment(comment).then((response) => {
      if (!this.isPostedComment && !navigator.onLine) {
        this._backSyncService.storeForBackSync('sync-comment', 'sync-new-comment', this.mergeJSONData(comment));
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          return true;
        }
      }
      else {
        this.isPostedComment = false;
      }

      return response;
    });
  }

  /**
   * MÉTODO PARA CREAR UN OBJETO JSON A PARTIR DE UN MODELO
   * @param comment EL OBJETO MODELO
   */
  mergeJSONData(comment: Comment) {
    var json = {
      id: comment.commentId,
      description: comment.description,
      id_publication: comment.publicationId,
      action_parent: (comment.commentParentId) ? comment.commentParentId : "",
      date: comment.dateRegister,
      active: true,
      userId: this._userService.getUserProfile().id,
      userName: this._userService.getUserProfile().person.name,
      userImage: this._userService.getUserProfile().profileImg
    }
    /////

    return json;
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO REGISTRO DE APOYO A UNA PUBLICACIÓN:
   */
  public sendRelevance(pubId: string, parentCommentId: string, isRelevance: boolean) {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userService.getUserKey()
    });
    const requestBody = JSON.stringify({
      id_publication: pubId,
      action_parent: parentCommentId,
      active: isRelevance,
      date: DateManager.getFormattedDate(),
      userId: this._userService.getUserProfile().id,
      userName: this._userService.getUserProfile().person.name,
      userImage: this._userService.getUserProfile().profileImg
    });

    return this._http.post(REST_SERV.relevanceUrl, requestBody, { headers: requestHeaders, withCredentials: true })
      .toPromise()
      .then((response: Response) => {
        this.isPostedRelevance = true;
        let respJson = response.json().data.active;

        return respJson;
      }).catch((error) => throwError(error));;
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO COMENTARIO O RESPUESTA EN EL BACKEND O EN SU DEFECTO PARA BACK SYNC:
   */
  public saveRelevance(pubId: string, parentCommentId: string, isRelevance: boolean) {
    return this.sendRelevance(pubId, parentCommentId, isRelevance).then((response) => {
      if (!this.isPostedRelevance && !navigator.onLine) {
        this._backSyncService.storeForBackSync('sync-relevance', 'sync-new-relevance', { id: new Date().toISOString(), id_publication: pubId, action_parent: parentCommentId, active: isRelevance, date: DateManager.getFormattedDate(), userId: this._userService.getUserProfile().id, userName: this._userService.getUserProfile().person.name, userImage: this._userService.getUserProfile().profileImg });
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          return "backSyncOk";
        }
      }
      else {
        this.isPostedRelevance = false;
      }

      return response;
    });
  }

  /**
   * MÉTODO PARA OBTENER COMENTARIOS/RESPUESTAS SEA DE LA WEB O DE LA CACHÉ
   * @param parentId ID DE PUBLICACIÓN / COMENTARIO
   * @param isReplies SI SE TRATA DE OBTENER RESPUESTAS DE UN COMENTARIO
   * @param pagePattern PATTERN DE PAGINACIÓN
   */
  public getCommentById(commentId: string) {
    const requestHeaders = new Headers({
      "Content-Type": "application/json",
      'X-Access-Token': this._userService.getUserKey()
    });

    return this._http.get(REST_SERV.commentUrl + "/" + commentId, {
      headers: requestHeaders,
      withCredentials: true
    }).toPromise()
      .then((response: Response) => {
        const respJson = response.json();
        if (response.status == 200) {
          let jsonComment = respJson.data;
          let comment: Comment = this.extractCommentJson(jsonComment);

          console.log("[LUKASK ACTION SERVICE] - COMMENT BY ID FROM WEB", comment);
          return comment;
        }
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  /**
   * MÉTODO PARA EXTRAER LOS DATOS DE UN NUEVO COMENTARIO Y CONVERTIRLO A UN OBJETO DE TIPO MODELO:
   * @param jsonComment 
   */
  public extractCommentJson(jsonComment: any) {
    let usr = this._userService.extractUserJson(jsonComment.user_register);

    return new Comment(jsonComment.id_action, jsonComment.description, jsonComment.publication, usr, jsonComment.action_parent, jsonComment.active, jsonComment.date_register, jsonComment.user_relevance ? jsonComment.user_relevance : false, jsonComment.count_relevance);
  }

  private extractOffComments(jsonComment: any) {
    let usr = this._userService.getUserProfile();

    return new Comment(jsonComment.id, jsonComment.description, jsonComment.id_publication, usr, jsonComment.action_parent, jsonComment.active, jsonComment.date, false, 0, true);
  }

  /**
   * MÉTODO PARA OBTENER COMENTARIOS Y RESPUESTAS OFFLINE:
   * @param parentId 
   * @param isReplies 
   */
  public getOffCommentsByPub(parentId: string, isReplies: boolean = false) {
    if ('indexedDB' in window) {
      return readAllData(!isReplies ? 'sync-comment' : 'sync-relevance')
        .then((tableData) => {
          let comments: Comment[] = [];

          for (let i = 0; i < tableData.length; i++) {
            if (!isReplies) {
              if (parentId == tableData[i].id_publication) {
                comments.push(this.extractOffComments(tableData[i]));
              }
            }
            else {
              if (parentId == tableData[i].action_parent) {
                comments.push(this.extractOffComments(tableData[i]));
              }
            }
          }

          if (isReplies) {
            console.log("[LUKASK ACTION SERVICE] - OFFLINE REPLIES OF A COMMENT WITH ID " + parentId + " FROM CACHE", comments);
          }
          else {
            console.log("[LUKASK ACTION SERVICE] - OFFLINE COMMENTS OF A PUBLICATION WITH ID " + parentId + " FROM CACHE", comments);
          }

          return comments;
        });
    }

    return new Promise((resolve, reject) => {
      this.isFetchedComments = true;
      resolve(null);
    });
  }

  /**
   * MÉTODO PARA ELIMINAR UNA RELEVANCIA OFFLINE ANTES DE SER ENVIADA AL SERVIDOR:
   * @param isCommentRel
   */
  public deleteOffRel(parentId: string, isCommentRel: boolean) {
    if ('indexedDB' in window) {
      return readAllData('sync-relevance')
        .then((tableData) => {
          for (let i = 0; i < tableData.length; i++) {
            if (!isCommentRel) {
              if (parentId == tableData[i].id_publication && !tableData[i].action_parent) {
                deleteItemData("sync-relevance", tableData[i].id)
              }
            }
            else {
              if (parentId == tableData[i].action_parent) {
                deleteItemData("sync-relevance", tableData[i].id)
              }
            }
          }
        });
    }

    return new Promise((resolve, reject) => {
      this.isFetchedComments = true;
      resolve(null);
    });
  }
}
