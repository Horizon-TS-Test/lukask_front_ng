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
    ) {
        if (dateRegister) {
            this.beutifyDate();
        }
    }

    private beutifyDate() {
        let currDate = moment();
        this.coolDate = DateManager.makeDateCool(this.dateRegister);
        if (currDate.diff(this.dateRegister, 'minutes') < 60) {
            currDate = moment();
            this.dateInterval = setInterval(() => {
                if (currDate.diff(this.dateRegister, 'minutes') >= 60) {
                    clearInterval(this.dateInterval);
                    this.dateInterval = setInterval(() => {
                        currDate = moment();
                        if (currDate.diff(this.dateRegister, 'hours') > 24) {
                            clearInterval(this.dateInterval);
                        }
                        this.coolDate = DateManager.makeDateCool(this.dateRegister);
                    }, 60000 * 60);
                }
                this.coolDate = DateManager.makeDateCool(this.dateRegister);
            }, 60000);
        }

        if (currDate.diff(this.dateRegister, 'hours') <= 24) {
            this.dateInterval = setInterval(() => {
                currDate = moment();
                if (currDate.diff(this.dateRegister, 'hours') > 24) {
                    clearInterval(this.dateInterval);
                }
                this.coolDate = DateManager.makeDateCool(this.dateRegister);
            }, 60000 * 60);
        }
    }
}