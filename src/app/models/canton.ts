import { Province } from "./province";

export class Canton {
    constructor(
        public id_canton?: string,
        public name?: string,
        public province?: Province,
    ) {
        this.province = new Province();
    }
}