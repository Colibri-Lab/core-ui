/**
 * Blob methods 
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.Blob = class {

    /**
     * Converts a Blob to a text string.
     * @param {Blob} blob - The Blob to convert.
     * @returns {Promise<{blob: Blob, text: string}>} - A promise that resolves to an object containing the original Blob and the converted text string.
     * @public
     * @async
     * @example 
     * ```
     * Colibri.Common.Blob.LoadAsText(blob)
     *   .then(({blob, text}) => {
     *     Use the text string
     *   })
     *   .catch(error => {
     *     Handle the error
     *   });
     * ```
     */
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

    /**
     * Converts a text string to a Blob.
     * @param {string} text - The text string to convert.
     * @param {string} type - The MIME type of the resulting Blob.
     * @returns {Blob} - The resulting Blob containing the text string.
     * @example
     * const text = "Hello, world!";
     * const blob = Colibri.Common.Blob.Text2Blob(text, 'text/plain');
     */
    static Text2Blob(text, type) {
        return new Blob([text], { type: type });
    }

}