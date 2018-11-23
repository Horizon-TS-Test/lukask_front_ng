import { Person } from "./person";
import { Profile } from "./profile";

export class User {
    public person: Person;
    public profiles: Profile[];

    constructor(
        public username: string,
        public password: string,
        public profileImg?: string,
        public isActive?: boolean,
        public file?: any,
        public fileName?: string,
        public id?: string,
        public isAdmin?: boolean,
    ) {
        this.person = new Person();
        this.profiles = [];
    }
}