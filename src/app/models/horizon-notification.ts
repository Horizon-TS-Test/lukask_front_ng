import { User } from "./user";

export class HorizonNotification {
    constructor(
        public description: string,
        public date: string,
        public url: string,
        public user: User
    ) { }
}