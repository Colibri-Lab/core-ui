/**
 * Represents a module class in the Colibri framework.
 * This class extends Colibri.IO.RpcRequest and provides functionality for managing modules.
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Common
 */
Colibri.Common.Wasm = class extends Colibri.Events.Dispatcher {

    /**
     * Creates a new instance of Colibri.Common.Wasm.
     * @constructor
     * @public
     */
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

    /**
     * Loads the WebAssembly module from the specified URI and initializes it with the provided memory size and configuration.
     * This method fetches the WebAssembly module from the specified URI, instantiates it with the provided memory size and configuration,
     * and sets up the necessary imports for the module. It also provides access to the exported functions and objects of the WebAssembly module.
     * The method returns a promise that resolves to the current instance of Colibri.Common.Wasm after the module is successfully loaded and initialized.
     * If the loading fails or the response status is not 200, an error will be thrown.
     * The method also dispatches a 'Loaded' event when the module is successfully loaded.
     * @param {number} [memoryByteSize=0] - The initial memory size in bytes for the WebAssembly module. If set to 0, no memory will be allocated.
     * @param {Object} [config={}] - An optional configuration object to be passed to the WebAssembly module.
     * @returns {Promise<Colibri.Common.Wasm>} A promise that resolves to the current instance of Colibri.Common.Wasm after the module is loaded and initialized.
     * @throws {Error} If there is an error loading the WebAssembly module or if the response status is not 200.
     * @async
     * @public
     */
    async Load(memoryByteSize = 0, config = {}) {

        await Colibri.Common.Wait(() => this._loaderLoaded);

        const response = await Colibri.IO.Request.Get(this._uri + '?_=' + Date.now(), { _responseType: 'arraybuffer' });
        if (response.status != 200) {
            throw new Error(`Failed to load WebAssembly module from ${this._uri}. Status: ${response.status}`);
        }

        this._memory = memoryByteSize ? new WebAssembly.Memory({
            initial: ((memoryByteSize + 0xffff) & ~0xffff) >>> 16,
            maximum: ((memoryByteSize * 10 + 0xffff) & ~0xffff) >>> 16,
            shared: true
        }) : null;
        this._config = config;


        const data = response.result;
        const arrayBuffer = new Uint8Array(data).buffer;
        let wasmInstance = null;

        // Объект импортов
        const imports = {
            env: {
                abort(msgPtr, filePtr, line, col) {
                    const message = wasmInstance?.exports?.__getString ? wasmInstance.exports.__getString(msgPtr) : `ptr:${msgPtr}`;
                    console.error("abort called at:", line, col, msgPtr, filePtr, "message:", message);
                },
                trace(msgPtr, n) {
                    const message = wasmInstance?.exports?.__getString ? wasmInstance.exports.__getString(msgPtr) : `ptr:${msgPtr}`;
                    console.log("trace:", message, "args:", n);
                }
            },
        };

        if(this._memory) {
            imports.env.memory = this._memory;
        }
        if(Object.isPlainObject(config) && Object.countKeys(config) > 0) {
            imports.config = config;
        }

        const instance = await loader.instantiate(arrayBuffer, imports);
        wasmInstance = instance;
        this._instance = instance;

        for (const key of Object.keys(instance.exports)) {
            if (typeof instance.exports[key] === "function") {
                this[key] = (...args) => this._instance.exports[key](...args);
            }
            if (typeof instance.exports[key] === "object" && instance.exports[key] instanceof WebAssembly.Global) {
                this[key] = instance.exports[key];
            }
        }

        this._memory = this._memory || instance.exports.memory;

        this._loaded = true;
        this.Dispatch('Loaded');
        return this;

    }

    /**
     * Gets the WebAssembly memory associated with the module.
     * @type {WebAssembly.Memory}
     */
    get memory() {
        return this._memory;
    }

    /**
     * Gets the WebAssembly instance associated with the module.
     * @type {WebAssembly.Instance}
     */
    get config() {
        return this._config;
    }

    /**
     * Gets the WebAssembly instance associated with the module.
     * @type {WebAssembly.Instance}
     */
    get loaded() {
        return this._loaded;
    }

    /**
     * Gets the WebAssembly instance associated with the module.
     * @type {WebAssembly.Instance}
     */
    get loaderLoaded() {
        return this._loaderLoaded;
    }

}