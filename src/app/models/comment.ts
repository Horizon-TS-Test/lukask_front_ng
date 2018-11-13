import * as moment from 'node_modules/moment';
import { User } from "./user";
import { DateManager } from '../tools/date-manager';

export class Comment {
    public coolDate: string;
    private dateInterval: any;

    constructor(
        public commentId: string,
        public description: string,
        public publicationId?: string,
        public user?: User,
        public commentParentId?: string,
        public active?: boolean,
        public dateRegister?: string,
        public userRelevance?: boolean,
        public relevance_counter?: number,
        public isOffline?: boolean,
        public offRelevance?: boolean
    ) {
        if(this.dateRegister) {
            this.beutifyDate();       
        }
    }

    public beutifyDate() {
        let currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
        let localDate = this.dateRegister.replace("Z", " ").replace("T", " ");
        
        this.coolDate = DateManager.makeDateCool(this.dateRegister);
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
                        this.coolDate = DateManager.makeDateCool(this.dateRegister);
                    }, 60000 * 60);
                }
                this.coolDate = DateManager.makeDateCool(this.dateRegister);
            }, 60000);
        }

        if (currDate.diff(localDate, 'hours') <= 24) {
            this.dateInterval = setInterval(() => {
                currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
                if (currDate.diff(localDate, 'hours') > 24) {
                    clearInterval(this.dateInterval);
                }
                this.coolDate = DateManager.makeDateCool(this.dateRegister);
            }, 60000 * 60);
        }
    }
}