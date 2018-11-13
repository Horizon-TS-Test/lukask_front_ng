import * as moment from 'node_modules/moment';
import { User } from "./user";
import { DateManager } from '../tools/date-manager';

export class HorizonNotification {
    public coolDate: string;
    private dateInterval: any;

    constructor(
        public description: string,
        public date: string,
        public url: string,
        public user: User
    ) {
        if (date) {
            this.beutifyDate();
        }
    }

    public beutifyDate() {
        let currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
        let localDate = this.date.replace("Z", " ").replace("T", " ");

        this.coolDate = DateManager.makeDateCool(this.date);
        if (currDate.diff(localDate, 'minutes') < 60) {
            this.dateInterval = setInterval(() => {
                currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
                if (currDate.diff(localDate, 'minutes') >= 60) {
                    clearInterval(this.dateInterval);
                    this.dateInterval = setInterval(() => {
                        currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
                        if (currDate.diff(localDate, 'hours') > 24) {
                            clearInterval(this.dateInterval);
                        }
                        this.coolDate = DateManager.makeDateCool(this.date);
                    }, 60000 * 60);
                }
                this.coolDate = DateManager.makeDateCool(this.date);
            }, 60000);
        }

        if (currDate.diff(localDate, 'hours') <= 24) {
            this.dateInterval = setInterval(() => {
                currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
                if (currDate.diff(localDate, 'hours') > 24) {
                    clearInterval(this.dateInterval);
                }
                this.coolDate = DateManager.makeDateCool(this.date);
            }, 60000 * 60);
        }
    }
}