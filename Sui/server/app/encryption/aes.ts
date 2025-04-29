import CryptoJS from 'crypto-js';
import { AES_SECRET_KEY } from '../constants';

class AESCryptor {
    private secretKey: string;

    constructor(secretKey: string) {
        if (secretKey.length !== 32) {
            throw new Error('Secret key must be 32 characters long for AES 256.');
        }
        this.secretKey = secretKey;
    }

    encrypt(message: string): string {
        const encrypted = CryptoJS.AES.encrypt(message, this.secretKey);
        return encrypted.toString();
    }

    decrypt(encryptedMessage: string): string {
        const decrypted = CryptoJS.AES.decrypt(encryptedMessage, this.secretKey);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}

const aes = new AESCryptor(AES_SECRET_KEY);

export default aes;
