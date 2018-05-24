import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  public UPDATE = "UPDATE";
  public DELETE = "DELETE";

  constructor() { }

  backendServerSays(action, modelArray: any[], lastDataModel: any, newDataModel?: any) {
    switch (action) {
      case this.UPDATE:
        if (lastDataModel) {
          //REF: https://appendto.com/2016/04/insert-remove-replace-elements-array-splice/
          modelArray.splice(modelArray.indexOf(lastDataModel), 1, newDataModel);
        }
        break;
      case this.DELETE:
        if (lastDataModel) {
          //REF: https://appendto.com/2016/04/insert-remove-replace-elements-array-splice/
          modelArray.splice(modelArray.indexOf(lastDataModel), 1);
        }
        break;
      default:
        if (!lastDataModel) {
          modelArray.push(newDataModel);
        }
        break;
    }

    return modelArray.slice();
  }
}
