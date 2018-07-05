import { User } from "./user";

export class Comment {
    constructor(
        public commentId: string,
        public description: string,
        public publicationId?: string,
        public user?: User,
        public commentParentId?: string,
        public active?: boolean,
        public date?: string,
    ) { }
}