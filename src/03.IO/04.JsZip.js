/**
 * Colibri.IO.JsZip is a utility class that provides functionality for loading the JSZip library and creating instances of JSZip for working with ZIP files in JavaScript.
 * @class
 * @memberof Colibri.IO
 */
Colibri.IO.JsZip = class {

    /**
     * Indicates whether the JSZip library has been loaded.
     * @type {boolean}
     * @static
     * @readonly
     */
    static loaded = false;

    /**
     * Loads the JSZip library and returns a Promise that resolves to a new instance of JSZip.
     * This method checks if the JSZip library is already loaded. If it is, it resolves the Promise with a new instance of JSZip.
     * If not, it attempts to load the library from a local path or a CDN. Once loaded, it sets the `loaded` property to true and resolves the Promise with a new instance of JSZip.
     * If loading fails, it rejects the Promise with an error.
     * @returns {Promise<JSZip>} A Promise that resolves to a new instance of JSZip.
     * @static
     * @async
     * @public
     * @example
     * ```
     * /// Load the JSZip library and create a new instance
     * Colibri.IO.JsZip.Load().then(jszipInstance => {
     *     console.log('JSZip loaded:', jszipInstance);
     * }).catch(error => {
     *     console.error('Failed to load JSZip:', error);
     * });
     * ```
     */
    static Load() {
        return new Promise((resolve, reject) => {
            if(Colibri.IO.JsZip.loaded) {
                resolve(new JSZip());
            } else {
                Colibri.Common.LoadScript((!App.Device.isElectron ? '/' : '') + 'res/jszip/jszip.min.js').then(() => {
                    Colibri.IO.JsZip.loaded = true;
                    resolve(new JSZip());
                }).catch(() => {
                    Colibri.Common.LoadScript('https://unpkg.com/jszip@latest/dist/jszip.min.js').then(() => {
                        Colibri.IO.JsZip.loaded = true;
                        resolve(new JSZip());
                    });
                });
            }
        });
    }

}