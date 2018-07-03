import { Canton } from "./canton";

export class Parroquia {
    constructor(
        public id_parroquia?: string,
        public name?: string,
        public canton?: Canton
    ) {
        this.canton = new Canton();
    }
}