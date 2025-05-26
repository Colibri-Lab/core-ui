/**
 * Blob methods 
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.Blob = class {

    static LoadAsText(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({blob, text: reader.result});
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(blob);
        });
    }

    static Text2Blob(text, type) {
        return new Blob([text], { type: type });
    }

}