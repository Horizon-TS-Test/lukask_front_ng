export class DateManager {

    constructor() { }

    /**
     * MÉTODO PARA OBTENER LA FECHA ACTUAL CON EL FORMATO DE LA BASE DE DATOS:
     */
    public static getFormattedDate() {
        var date = new Date();
        var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return str;
    }
}