import { User } from "./user";

export class Comment {
    constructor(
        public id: string,
        public description: string,
        public id_publication?: string,
        public user?: User,
        public id_comment?: string,
    ) { }
}