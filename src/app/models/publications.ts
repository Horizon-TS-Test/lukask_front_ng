import { Media } from "./media";
import { User } from "./user";

export class Publication {
    public media: Media[];

    constructor(
        public id_publication: string,
        public latitude: number,
        public longitude: number,
        public detail: string,
        public date_pub: string,
        public priority?: string,
        public active?: boolean,
        public type?: string,
        public user?: User,
    ) {
        this.media = [];
    }
}