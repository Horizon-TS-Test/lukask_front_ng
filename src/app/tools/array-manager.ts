export class ArrayManager {
    public static CREATE = "CREATE";
    public static CUSTOM_CREATE = "CUSTOM_CREATE";
    public static UPDATE = "UPDATE";
    public static CUSTOM_UPDATE = "CUSTOM_UPDATE";
    public static DELETE = "DELETE";

    constructor() { }

    public static backendServerSays(action, modelArray: any[], lastDataModel: any, newDataModel?: any) {
        let resp: boolean = false;
        switch (action) {
            case this.CREATE:
                if (!lastDataModel) {
                    //INSERT ARRAY ELEMENT TO AN SPECIFIC POSITION:
                    //REF: https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index
                    modelArray.splice(0, 0, newDataModel);
                    ////
                    resp = true;
                }
                break;
            case this.CUSTOM_CREATE:
                if (!lastDataModel) {
                    //INSERT ARRAY ELEMENT TO AN SPECIFIC POSITION:
                    //REF: https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index
                    modelArray.splice(0, 0, newDataModel);
                    ////
                    resp = true;
                }
                break;
            case this.UPDATE:
                if (lastDataModel) {
                    //REF: https://appendto.com/2016/04/insert-remove-replace-elements-array-splice/
                    modelArray.splice(modelArray.indexOf(lastDataModel), 1, newDataModel);
                    resp = true;
                }
                break;
            case this.CUSTOM_UPDATE:
                if (lastDataModel) {
                    //REF: https://appendto.com/2016/04/insert-remove-replace-elements-array-splice/
                    modelArray.splice(modelArray.indexOf(lastDataModel), 1, newDataModel);
                    resp = true;
                }
                break;
            case this.DELETE:
                if (lastDataModel) {
                    //REF: https://appendto.com/2016/04/insert-remove-replace-elements-array-splice/
                    modelArray.splice(modelArray.indexOf(lastDataModel), 1);
                    resp = true;
                }
                break;
        }

        return resp;
    }

    /**
     * METODO PARA INCLUIR UN OBJETO JAVASCRIPT DENTRO DE OTRO:
     * @param mainObj OBJETO PRINCIPAL
     * @param newObj NUEVO OBJETO A SER INCLUIDO
     */
    public static mergeJavascriptObj(mainObj, newObj) {
        for (var key in newObj) {
            if (newObj.hasOwnProperty(key)) mainObj[key] = newObj[key];
        }
        return mainObj;
    }
}