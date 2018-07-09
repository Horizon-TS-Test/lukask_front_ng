export class Payment {
    constructor(
        public factura?: string,
        public empresa?: string,
        public nombre?: string,
        public ci?: number,
        public medidor?: number,
        public direccion?: string,
        public fechaemision?: string,
        public fechapago?: string,
        public subtotal?: number,
        public total?: number
    ) { }
}