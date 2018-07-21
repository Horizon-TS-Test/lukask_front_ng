import * as moment from 'node_modules/moment';
import { Media } from "./media";
import { User } from "./user";
import { QuejaType } from "./queja-type";
import { DateManager } from "../tools/date-manager";

export class Publication {
    public media: Media[];
    public coolDate: string;
    private dateInterval: any;

    constructor(
        public id_publication: string,
        public latitude: number,
        public longitude: number,
        public detail: string,
        public date_pub: string,
        public priority?: string,
        public active?: boolean,
        public type?: QuejaType,
        public user?: User,
        public location?: string,
        public relevance_counter?: number,
        public user_relevance?: boolean,
        public address?: string,
        public isTrans?: boolean,
        public transDone?: boolean
    ) {
        if ((this.date_pub)) {
            this.beutifyDate();
        }
        this.media = [];
    }

    private beutifyDate() {
        let currDate = moment();

        this.coolDate = DateManager.makeDateCool(this.date_pub);
        if (currDate.diff(this.date_pub, 'minutes') < 60) {
            this.dateInterval = setInterval(() => {
                if (currDate.diff(this.date_pub, 'hours') >= 60) {
                    clearInterval(this.dateInterval);
                }
                this.coolDate = DateManager.makeDateCool(this.date_pub);
            }, 60000);
        }

        if (currDate.diff(this.date_pub, 'hours') <= 24) {
            this.dateInterval = setInterval(() => {
                if (currDate.diff(this.date_pub, 'hours') > 24) {
                    clearInterval(this.dateInterval);
                }
                this.coolDate = DateManager.makeDateCool(this.date_pub);
            }, 60000 * 60);
        }
    }
}