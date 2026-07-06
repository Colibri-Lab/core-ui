

Colibri.Modules.Waterfall = class extends Colibri.Common.Wasm {

    _wasm = null;

    constructor(initialMemorySize = 0, config = {}) {
        super('/res/waterfall.wasm');
        this._wasmLoaded = false;
        this.Load(initialMemorySize, config);
    }

    Add(time, delta, chunk) {
        if (!this.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }
        
        this.add(BigInt(time), Number(delta), chunk);
    }

}
