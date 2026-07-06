/**
 * Represents a module class in the Colibri framework.
 * This class extends Colibri.IO.RpcRequest and provides functionality for managing modules.
 * @class 
 * @extends Colibri.IO.RpcRequest
 * @memberof Colibri.Modules
 */
Colibri.Common.Wasm = class extends Colibri.Events.Dispatcher {

    constructor(uri) {
        super();
        this._uri = uri;
        this._loaded = false;
        this._loaderLoaded = false;
        
        this.RegisterEvent('Loaded', false, 'When loaded the wasm file');

        this._loaderLoaded = false;
        Colibri.Common.LoadScript('https://cdn.jsdelivr.net/npm/@assemblyscript/loader/umd/index.js').then(() => {
            this._loaderLoaded = true;
        });


    }

    async Load(memoryByteSize = 0, config = {}) {

        await Colibri.Common.Wait(() => this._loaderLoaded);

        const response = await Colibri.IO.Request.Get(this._uri + '?_=' + Date.now(), { _responseType: 'arraybuffer' });
        if (response.status != 200) {
            throw new Error(`Failed to load WebAssembly module from ${this._uri}. Status: ${response.status}`);
        }

        this._memory = memoryByteSize ? new WebAssembly.Memory({
            initial: ((memoryByteSize + 0xffff) & ~0xffff) >>> 16
        }) : null;
        this._config = config;

        const data = response.result;
        const arrayBuffer = new Uint8Array(data).buffer;

        // Объект импортов
        const imports = {
            env: {
                memory: this._memory,
                abort(msgPtr, filePtr, line, col) {
                    console.error("abort called at:", line, col, msgPtr, filePtr);
                },
                trace(msgPtr, n) {
                    console.log("trace called");
                }
            },
            config: config
        };
        const instance = await loader.instantiate(arrayBuffer, imports);
        this._instance = instance;

        for (const key of Object.keys(instance.exports)) {
            if (typeof instance.exports[key] === "function") {
                this[key] = (...args) => this._instance.exports[key](...args);
            }
        }

        this._loaded = true;
        this.Dispatch('Loaded');
        return this;

    }

    get memory() {
        return this._memory;
    }

    get config() {
        return this._config;
    }

    get loaded() {
        return this._loaded;
    }

    get loaderLoaded() {
        return this._loaderLoaded;
    }

}