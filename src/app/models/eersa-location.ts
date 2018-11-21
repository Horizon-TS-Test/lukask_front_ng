export class EersaLocation {
    constructor(
        public calle: string,
        public idBarrio: number,
        public referencia: string,
        public descBarrio?: string
    ) { }
}