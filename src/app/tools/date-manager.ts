import * as moment from 'node_modules/moment';

const _MONTHS_PER_YEAR: number = 12;
const _WEEKS_PER_MONTH: number = 4;
const _DAYS_PER_MONTH: number = 31;
const _DAYS_PER_WEEK: number = 7;
const _HOURS_PER_DAY: number = 24
const _MAX_HOURS: number = 6

const _MAX_MINUTES: number = 60;
const _MAX_SECONDS: number = 60;
const _TEXT_FORMAT: string = "Hace "

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

    /**
     * MÉTODO PARA FORMATO DE FECHAS EN LENGUAJE COLOQUIAL
     * @param date 
     */
    public static makeDateCool(date: string) {
        //Eliminamos caracteres de la fecha.
        date = date.replace("T", " ").replace("Z", " ");

        //Inicializamos variables para los calculos
        let currentDate = moment();
        let localDateData = moment(date);

        //Encontramos la cantidad de segundos transcuridos segun la fecha actual a la fecha registrada
        let diff = currentDate.diff(localDateData, 'seconds');
        let textTime: string;

        if (diff < _MAX_SECONDS) {
            return "Hace pocos segundos"
        }

        //Encontramos la cantidad de minutos transcuridos segun la fecha actual a la fecha registrada
        diff = currentDate.diff(localDateData, 'minutes');
        textTime = diff > 1 ? " minutos" : " minuto";
        if (diff < _MAX_MINUTES) {
            return _TEXT_FORMAT + diff + textTime;
        }

        //Encontramos la hours de minutos transcuridos segun la fecha actual a la fecha registrada
        diff = currentDate.diff(localDateData, 'hours');
        textTime = diff > 1 ? " horas" : " hora";
        if (diff <= _MAX_HOURS) {
            return _TEXT_FORMAT + diff + textTime;
        }

        diff = currentDate.diff(localDateData, 'days');
        if (diff < _DAYS_PER_WEEK) {
            //REF: https://stackoverflow.com/questions/17493309/how-do-i-change-the-language-of-moment-js
            date = moment(date).locale("es").calendar();
            date = date.substring(0, 1).toUpperCase() + date.substring(1);
            return date;
        }

        //REF: https://stackoverflow.com/questions/17493309/how-do-i-change-the-language-of-moment-js
        return moment(date).locale("es").format('DD, MMMM. YYYY- H:mm:ss').replace(",", " de").replace(".", " de").replace("-", " a las");
    }
}