import { Parroquia } from "./parroquia";

export class Person {

    constructor(
        public id_person?: string,
        public age?: number,
        public identification_card?: string,
        public name?: string,
        public last_name?: string,
        public telephone?: string,
        public address?: string,
        public active?: boolean,
        public birthdate?: string,
        public cell_phone?: string,
        public parroquia?: Parroquia,
        //public location?: any,
        public transBirthDate?: string
    ) {
        this.parroquia = new Parroquia();
    }
}