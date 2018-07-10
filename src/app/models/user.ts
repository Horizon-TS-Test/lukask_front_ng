import { Person } from "./person";
import { Parroquia } from "./parroquia";

export class User {
    public person: Person;

    constructor(
        public username: string,
        public password: string,
        public profileImg?: string,
        public isActive?: boolean,
        public file?: any,
        public fileName?: string,
        public id?: string,
        public objParroquia?: Parroquia,
    ) {
        this.person = new Person();
        this.objParroquia = new Parroquia();
    }
}