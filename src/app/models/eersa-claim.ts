import { EersaClient } from "./eersa-client";
import { EersaLocation } from "./eersa-location";

export class EersaClaim {
    constructor(
        public nPoste: string,
        public cliente: EersaClient,
        public ubicacion: EersaLocation,
        public idTipo: number,
        public detalleReclamo: string
    ) {
        cliente = new EersaClient('', '', null);
    }
}