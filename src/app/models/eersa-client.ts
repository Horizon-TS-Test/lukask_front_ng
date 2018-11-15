import { User } from "./user";

export class EersaClient {
    constructor(
        public nCuenta: string,
        public nMedidor: string,
        public user: User
    ) {
        user = new User('', '');
    }
}