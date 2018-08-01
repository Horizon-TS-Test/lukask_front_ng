export class Payment {
    constructor(
        public factura?: string,
        public empresa?: string,
        public nombre?: string,
        public ci?: string,
        public medidor?: string,
        public direccion?: string,
        public fechaemision?: string,
        public fechapago?: string,
        public subtotal?: number,
        public total?: number,
        public icon?: string
    ) { }
}