import { Person } from "./person";

export class User {
    public id: string;
    public person: Person;

    constructor(
        public username: string,
        public password: string,
        public profileImg?: string
    ) {
        this.person = new Person();
    }
}