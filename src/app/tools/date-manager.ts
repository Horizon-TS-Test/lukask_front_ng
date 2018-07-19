import * as moment from 'node_modules/moment'; 
import { formatDate } from '../../../node_modules/@angular/common';
import { IfStmt } from '../../../node_modules/@angular/compiler';

const _MAXMONTH:number = 12;
const _MAXWEEK:number = 4;
const _MAXDAYMONTH:number = 31;
const _MAXDAYFORWEEK:number = 7;
const _MAXHOURS:number = 24
const _MAXMINUTES:number = 60; 
const _MAXSECONDS:number = 60; 
const _TEXTFORMAT:string = "hace "

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
     * Proceso para formato de fechas en unidades de tiempo.
     * @param dataToFormat 
     */
    public static setFormatDate(dataToFormat:any){
        for(var itemData in dataToFormat){
            this.formatDate(dataToFormat[itemData]);
        }
    }

    /**
     * Algoritmo para formateo de datos, segun su fecha de creacion o registro
     * @param itemData 
     */
    private static formatDate(itemData:any){
        
        //Eliminamos caracteres de la fecha.
        let cadena  = itemData.date_pub.replace("T", " ");
        cadena = cadena.replace("Z", "");
        
        //Inicializamos variables para los calculos
        let currentDate = moment();
        let localDateData = moment(cadena);

        //Encontramos la cantidad de segundos transcuridos segun la fecha actual a la fecha registrada
        let diff = currentDate.diff(localDateData, 'seconds');
        let textTime:string;

        if(diff < _MAXSECONDS){
            textTime = "segundos"
            itemData.date_pub = "Hace pocos segundos"
        }else{
            
            //Encontramos la cantidad de minutos transcuridos segun la fecha actual a la fecha registrada
            diff = currentDate.diff(localDateData, 'minutes');
            textTime = diff > 1 ? " minutos" : " minuto";
            if(diff < _MAXMINUTES){
                itemData.date_pub = _TEXTFORMAT + diff + textTime;
            }else{
                
                //Encontramos la hours de minutos transcuridos segun la fecha actual a la fecha registrada
                diff = currentDate.diff(localDateData, 'hours');
                textTime = diff > 1  ? " horas" : " hora";
                if(diff < _MAXHOURS){
                    itemData.date_pub = _TEXTFORMAT + diff + textTime;
                }else{
                    
                    //Encontramos la dias de minutos transcuridos segun la fecha actual a la fecha registrada
                    diff = currentDate.diff(localDateData, 'days');
                    textTime = diff > 1  ? " dias" : " dia";
                    if(diff < _MAXDAYFORWEEK){
                        itemData.date_pub = _TEXTFORMAT + diff + textTime;
                    }
                }
            }
        }
    }
}