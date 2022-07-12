Colibri.IO.Crypt = class {

    static Encrypt(key, data) {
        return new Promise((resolve, reject) => {
            key.sha256().then((sha256) => {
                const encoded = data.rc4(sha256);
                resolve(encoded);
            }).catch(error => reject(error));
        });
    }

    static Decrypt(key, data) {
        return Colibri.IO.Crypt.Encrypt(key, data);
    }

}