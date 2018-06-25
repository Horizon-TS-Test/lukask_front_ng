import { Person } from "./person";

export class User {
    public person: Person;
    
    constructor(
        public username: string,
        public password: string,
        public profileImg?: string,
        public isActive?: boolean,
        public file?: any,
        public fileName?: string,
        public id?: string
    ) {
        this.person = new Person();
     }
}