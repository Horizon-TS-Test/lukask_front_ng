import { EersaClient } from "./eersa-client";
import { EersaLocation } from "./eersa-location";

export class EersaClaim {
    constructor(
        public eersaClaimId: string,
        public nPoste: string,
        public cliente: EersaClient,
        public ubicacion: EersaLocation,
        public idTipo: number,
        public detalleReclamo: string,
        public descTipo?: string
    ) {
        cliente = new EersaClient('', '', null);
        ubicacion = new EersaLocation('', null, null);
    }
}