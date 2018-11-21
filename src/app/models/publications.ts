import { Media } from "./media";
import { User } from "./user";
import { QuejaType } from "./queja-type";
import { DateManager } from "../tools/date-manager";
import { EersaClaim } from './eersa-claim';
import * as moment from 'node_modules/moment';

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
        public transDone?: boolean,
        public isOffline?: boolean,
        public offRelevance?: boolean,
        public eersaClaim?: EersaClaim
    ) {
        if (this.date_pub) {
            this.beutifyDate();
        }
        this.media = [];
        this.eersaClaim = new EersaClaim(null, null, null, null, null, null);
    }

    public beutifyDate() {
        let currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
        let localDate = this.date_pub.replace("Z", " ").replace("T", " ");

        this.coolDate = DateManager.makeDateCool(this.date_pub);
        if (currDate.diff(localDate, 'minutes') < 60) {
            this.dateInterval = setInterval(() => {
                currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
                if (currDate.diff(localDate, 'minutes') >= 60) {
                    clearInterval(this.dateInterval);
                    this.dateInterval = setInterval(() => {
                        if (currDate.diff(localDate, 'hours') > 24) {
                            clearInterval(this.dateInterval);
                        }
                        this.coolDate = DateManager.makeDateCool(this.date_pub);
                    }, 60000 * 60);
                }
                this.coolDate = DateManager.makeDateCool(this.date_pub);
            }, 60000);
        }

        if (currDate.diff(localDate, 'hours') <= 24) {
            this.dateInterval = setInterval(() => {
                currDate = moment(new Date, "YYYY-MM-DD H:mm:ss").locale("es");
                if (currDate.diff(localDate, 'hours') > 24) {
                    clearInterval(this.dateInterval);
                }
                this.coolDate = DateManager.makeDateCool(this.date_pub);
            }, 60000 * 60);
        }
    }
}