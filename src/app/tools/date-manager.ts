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

const _MONTHS: any = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export class DateManager {
    constructor() { }

    /**
     * METODO PARA OBTENER LA FECHA ACTUAL CON EL FORMATO DE LA BASE DE DATOS:
     */
    public static getFormattedDate() {
        let date = new Date();
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }

    /**
     * METODO PARA OBTENER LA FECHA ACTUAL EN LENGUAJE COLOQUIAL:
     */
    public static getStringDate() {
        let date = new Date();
        let minutes = date.getMinutes() + "";
        let seconds = date.getSeconds() + "";

        return date.getDate() + " de " + _MONTHS[date.getMonth()] + " de " + date.getFullYear() + " " + date.getHours() + ":" + (minutes.length == 1 ? + "0" + minutes : minutes) + ":" + (seconds.length == 1 ? + "0" + seconds : seconds);
    }

    /**
     * METODO PARA FORMATO DE FECHAS EN LENGUAJE COLOQUIAL
     * @param date 
     */
    public static makeDateCool(date: string) {
        //Eliminamos caracteres de la fecha.
        date = date.replace("T", " ").replace("Z", " ");

        //Inicializamos variables para los calculos
        let currentDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
        let localDateData = moment(date, "YYYY-MM-DD H:mm:ss").locale("es");

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
            date = moment(date, 'YYYY-MM-DD H:mm:ss').locale("es").calendar();
            date = date.substring(0, 1).toUpperCase() + date.substring(1);
            return date;
        }

        //REF: https://stackoverflow.com/questions/17493309/how-do-i-change-the-language-of-moment-js
        return moment(date, 'YYYY-MM-DD H:mm:ss').locale("es").format('DD, MMMM. YYYY- H:mm:ss').replace(",", " de").replace(".", " de").replace("-", " a las");
    }

    /**
     * METODO QUE CALCULA LA EDAD
     */
    public static calcAge(date: string) {
        var hoy = new Date();
        var cumpleanos = new Date(date);
        var edad = hoy.getFullYear() - cumpleanos.getFullYear();
        var m = hoy.getMonth() - cumpleanos.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
            edad--;
        }

        return edad;
    }

    /**
   * METODO QUE TRANSFORMA UN STRING EN FORMATO DE FECHA:
   */
    public static convertStringToDate(string) {
        var info = string.split('-');
        return info[0] + '-' + info[1] + '-' + info[2].substr(0, 2);
    }
}