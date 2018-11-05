import { Injectable } from '@angular/core';
import { Comment } from "../models/comment";
import { ActionService } from "../services/action.service";
import { REST_SERV } from "../rest-url/rest-servers";
import { ArrayManager } from "../tools/array-manager";

declare var readAllData: any;
declare var writeData: any;
declare var deleteItemData: any;
declare var upgradeTableFieldDataArray: any;

@Injectable({
  providedIn: 'root'
})
export class ActionFeederService {
  private pageLimit: number;
  private firstPattern: string;

  constructor(
    private _actionService: ActionService
  ) { }

  /**
   * MÉTODO PARA OBTENER LAS RELEVANCIAS OFFLINE DESDE LA CACHÉ, PARA AÑADIR ESTILOS A LOS COMENTARIOS,
   * AL MOMENTO DE RECARGAR LA PÁGIN ESTANDO EN MODO OFFLINE:
   */
  private getOfflineComRelevances(comList: Comment[]) {
    if ('indexedDB' in window) {
      readAllData('sync-relevance')
        .then((offPubRelevances) => {
          for (let pubRel of offPubRelevances) {
            if (pubRel.action_parent) {
              for (let i = 0; i < comList.length; i++) {
                if (comList[i].commentId == pubRel.action_parent) {
                  comList[i].offRelevance = true;
                }
              }
            }
          }
        });
    }
  }

  /**
   * MÉTODO PARA OBTENER LOS COMENTARIOS OFFLINE, PENDIENTES DE ENVÍO:
   */
  private getOfflineComments(pubId: string, commentList: Comment[]) {
    this._actionService.getOffCommentsByPub(pubId).then((dataResponse: any) => {
      let offComments: Comment[] = <Comment[]>dataResponse;
      for (let comment of offComments) {
        commentList.splice(0, 0, comment);
      }
    });
  }

  /**
   * MÉTODO PARA CARGAR LOS COMENTARIOS DESDE EL BACKEND:
   */
  public getComments(pubId: string, halfModal: boolean = false) {
    if (halfModal) {
      this.pageLimit = this._actionService.MOBILE_LIMIT;
    }
    else {
      this.pageLimit = this._actionService.DEFAULT_LIMIT;
    }
    return this._actionService.getCommentByPub(pubId, false, this.pageLimit)
      .then((commentsData: any) => {
        this.firstPattern = commentsData.pagePattern;
        let commentList = commentsData.comments;
        this.getOfflineComRelevances(commentList);
        this.getOfflineComments(pubId, commentList);

        return { comments: commentList, pagePattern: this.firstPattern };
      });
  }

  /**
   * MÉTODO PARA CARGAR MAS COMENTARIOS BAJO PETICIÓN
   */
  private getMoreComments(pubId: string, currentPattern: string, commentList: Comment[]) {
    return this._actionService.getMoreCommentByPub(pubId, false, currentPattern)
      .then((commentsData: any) => {
        this.getOfflineComRelevances(commentsData.comments);
        commentList = commentList.concat(commentsData.comments);
        return { comments: commentList, pagePattern: commentsData.pagePattern };
      });
  }

  /**
   * MÉTODO PARA ATENDER A LA SOLICITUD DE OBTENER MAS COMENTARIOS:
   */
  public askForMore(pubId: string, currentPattern: string, commentList: Comment[], lessComments: boolean) {
    if (lessComments) {
      return this.getMoreComments(pubId, currentPattern, commentList);
    }
    else {
      let promise = new Promise((resolve, reject) => {
        currentPattern = this.firstPattern;
        commentList.splice(this.pageLimit, commentList.length - this.pageLimit);

        resolve({ comments: commentList, pagePattern: currentPattern });
      });

      return promise;
    }
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL PATTERN QUE VIENE DEL BACKEND PARA NO COMPROMETER LA SECUENCIA 
   * DE REGISTRO A TRAER DEL BACKEND BAJO DEMANDA, CUANDO SE REGISTRE UN NUEVO COMENTARIO:
   */
  private updatePattern(currentPattern: string) {
    if (currentPattern) {
      let offsetPos = currentPattern.indexOf("=", currentPattern.indexOf("offset")) + 1;
      let newOffset = parseInt(currentPattern.substring(offsetPos)) + 1;
      currentPattern = currentPattern.substring(0, offsetPos) + newOffset;
    }

    return currentPattern;
  }

  /**
 * MÉTODO PARA ACTUALIZAR INFORMACIÓN DE LA LISTA DE PUBLICACIONES
 * @param pubJson JSON COMMING FROM THE SOCKET.IO SERVER OR AS A NORMAL HTTP RESPONSE:
 * @param action THIS CAN BE CREATE, UPDATE OR DELETE:
 */
  public updateCommentList(pubId: string, commentJson: any, action: string, currentPattern: string, commentList: Comment[], mainComments: Comment[]) {
    if (commentJson.publication == pubId && !commentJson.action_parent) {
      let lastComment: Comment, newCom: Comment;

      //UPDATING THE BACKEND SERVER IP/DOMAIN:
      commentJson.profile_path = ((commentJson.user_register.profile_path.indexOf("http") == -1) ? REST_SERV.mediaBack : "") + commentJson.user_register.profile_path;
      ////

      //REF: https://stackoverflow.com/questions/39019808/angular-2-get-object-from-array-by-id
      lastComment = commentList.find(com => com.commentId === commentJson.id_action);

      if (action != ArrayManager.DELETE) {
        newCom = this._actionService.extractCommentJson(commentJson);
      }

      //STORING THE NEW DATA COMMING FROM SOMEWHERE IN INDEXED-DB:
      mainComments[mainComments.length] = commentJson;
      upgradeTableFieldDataArray("comment", mainComments);
      ////

      if (ArrayManager.backendServerSays(action, commentList, lastComment, newCom) == true) {
        if (action == ArrayManager.CREATE) {
          this.updatePattern(currentPattern);
        }
      }
    }
  }

  /**
   * MÉTODO PARA ACTUALIZAR EL REGISTRO EN INDEXED-DB
   */
  public updateRelNumberIndexDb(comId: string, newRelCount: number, userId: any) {
    readAllData("comment")
      .then(function (tableData) {
        let dataToSave;
        for (var t = 0; t < tableData.length; t++) {
          if (tableData[t].id_action === comId) {
            dataToSave = tableData[t];
            dataToSave.count_relevance = newRelCount;
            if (userId == dataToSave.user_register.id) {
              dataToSave.user_relevance = true;
            }
            deleteItemData("comment", tableData[t].id_action)
              .then(function () {
                writeData("comment", dataToSave);
              });
            t = tableData.length;
          }
        }
      });
  }

  /**
   * MÉTODO PARA ELIMINAR EL COMENTARIO OFFLINE, CUANDO YA SE HAYA GUARDADO EN EL SERVIDOR Y 
   * VENGA COMO RESPUESTA EN EL SOCKET.IO
   * @param newCom 
   */
  public deleteOffComAsoc(newCom: Comment, commentList: Comment[]) {
    //PARA PODER ELIMINAR UNA PUB OFFLINE, LUEGO DE SER GUARDAR:
    for (let i = 0; i < commentList.length; i++) {
      if (commentList[i].isOffline) {
        let offDate = new Date(commentList[i].dateRegister).getTime();;
        let comDate = new Date(newCom.dateRegister.replace("T", " ").replace("Z", "")).getTime();;

        if (commentList[i].description == newCom.description && offDate.toString() == comDate.toString() && commentList[i].publicationId == newCom.publicationId && commentList[i].commentParentId == newCom.commentParentId && commentList[i].user.id == newCom.user.id) {
          commentList.splice(i, 1);
        }
      }
    }
    ////
  }
}