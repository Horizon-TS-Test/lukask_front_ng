import * as cryptoJS from 'crypto-js';
import { secret_key } from './../config/secret';

export class CrytoGen {

    private static ENCRYPTION_KEY: string = secret_key.toString();

    public static encrypt(text) {
        let cipher = cryptoJS.AES.encrypt(text, this.ENCRYPTION_KEY);
        var encrypted = cipher.toString(cryptoJS.enc.hex);

        return encrypted;
    }

    public static decrypt(encrypted) {
        let decipher = cryptoJS.AES.decrypt(encrypted, this.ENCRYPTION_KEY);
        var decrypted = decipher.toString(cryptoJS.enc.Utf8);

        return decrypted;
    }
}