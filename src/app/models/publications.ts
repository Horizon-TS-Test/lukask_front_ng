import { Media } from "./media";
import { User } from "./user";
import { QuejaType } from "./queja-type";

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
        public type?: QuejaType,
        public user?: User,
        public position?: number,
    ) {
        this.media = [];
    }
}