/**
 * Provides encryption and decryption functionality.
 * @class
 * @memberof Colibri.IO
 */
Colibri.IO.Crypt = class {

    /**
     * Encrypts the given data using the specified key.
     * @param {string} key The encryption key.
     * @param {string} data The data to encrypt.
     * @returns {Promise<string>} A promise that resolves to the encrypted data.
     * @async
     * @public
     * @static
     * @example
     * ```
     * /// Encrypt data using a key
     * const key = 'my-secret-key';
     * const data = 'Hello, world!';
     * const encryptedData = await Colibri.IO.Crypt.Encrypt(key, data);
     * console.log('Encrypted data:', encryptedData);
     * ```
     */
    static Encrypt(key, data) {
        return new Promise((resolve, reject) => {
            key.sha256().then((sha256) => {
                const encoded = data.rc4(sha256);
                resolve(encoded);
            }).catch(error => reject(error));
        });
    }

    /**
     * Decrypts the given data using the specified key.
     * @param {string} key The decryption key.
     * @param {string} data The data to decrypt.
     * @returns {Promise<string>} A promise that resolves to the decrypted data.
     * @async
     * @public
     * @static
     * @example
     * ```
     * /// Decrypt data using a key
     * const key = 'my-secret-key';
     * const encryptedData = await Colibri.IO.Crypt.Encrypt(key, data);
     * const decryptedData = await Colibri.IO.Crypt.Decrypt(key, encryptedData);
     * console.log('Decrypted data:', decryptedData);
     * ```
     */
    static Decrypt(key, data) {
        return Colibri.IO.Crypt.Encrypt(key, data);
    }

}