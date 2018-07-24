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
        if (this.date) {
            this.beutifyDate();
        }
    }

    private beutifyDate() {
        let currDate = moment();
        this.coolDate = DateManager.makeDateCool(this.date);
        if (currDate.diff(this.date, 'minutes') < 60) {
            currDate = moment();
            this.dateInterval = setInterval(() => {
                if (currDate.diff(this.date, 'minutes') >= 60) {
                    clearInterval(this.dateInterval);
                    this.dateInterval = setInterval(() => {
                        currDate = moment();
                        if (currDate.diff(this.date, 'hours') > 24) {
                            clearInterval(this.dateInterval);
                        }
                        this.coolDate = DateManager.makeDateCool(this.date);
                    }, 60000 * 60);
                }
                this.coolDate = DateManager.makeDateCool(this.date);
            }, 60000);
        }

        if (currDate.diff(this.date, 'hours') <= 24) {
            this.dateInterval = setInterval(() => {
                currDate = moment();
                if (currDate.diff(this.date, 'hours') > 24) {
                    clearInterval(this.dateInterval);
                }
                this.coolDate = DateManager.makeDateCool(this.date);
            }, 60000 * 60);
        }
    }
}