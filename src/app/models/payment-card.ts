export class PaymentCard {
    constructor(
        public email: string,
        public numero: string,
        public mes: string,
        public anio: string,
        public cvv: string,
    ) { }
}