/**
 * Represents a module class in the Colibri framework.
 * This class extends Colibri.IO.RpcRequest and provides functionality for managing modules.
 * @class 
 * @extends Colibri.IO.RpcRequest
 * @memberof Colibri.Modules
 */
Colibri.Common.Wasm = class {

    constructor(uri) {
        this._uri = uri;

        this._loaderLoaded = false;
        Colibri.Common.LoadScript('https://cdn.jsdelivr.net/npm/@assemblyscript/loader/umd/index.js').then(() => {
            this._loaderLoaded = true;
        });

    }

    async Load() {

        await Colibri.Common.Wait(() => this._loaderLoaded);

        const response = await Colibri.IO.Request.Get(this._uri + '?_=' + Date.now(), { _responseType: 'arraybuffer' });
        if (response.status != 200) {
            throw new Error(`Failed to load WebAssembly module from ${this._uri}. Status: ${response.status}`);
        }

        const data = response.result;
        const arrayBuffer = new Uint8Array(data).buffer;

        // Объект импортов
        const imports = {
            env: {
                abort(msgPtr, filePtr, line, col) {
                    console.error("abort called at:", line, col, msgPtr, filePtr);
                },
                trace(msgPtr, n) {
                    console.log("trace called");
                }
            }
        };
        const instance = await loader.instantiate(arrayBuffer, imports);
        this._instance = instance;

        for (const key of Object.keys(instance.exports)) {
            if (typeof instance.exports[key] === "function") {
                this[key] = (...args) => this._instance.exports[key](...args);
            }
        }

        return this;

    }


}