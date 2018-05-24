export class Media {
    constructor(
        public id: string,
        public format: string,
        public url?: string,
        public active?: boolean,
        public file?: any,
        public fileName?: string
    ) { }
}