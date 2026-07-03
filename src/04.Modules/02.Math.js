Colibri.Modules.Math = class {

    constructor() {
        this._wasmLoaded = false;
        this._wasm = new Colibri.Common.Wasm('/res/math/math.wasm');
        this._wasm.Load().then(() => {
            this._wasmLoaded = true;
        });
    }

    get loaded() {
        return this._wasmLoaded;
    }

    voltsToDb(arr, reference = 1.0) {
        if (!this._wasmLoaded) {
            throw new Error("WASM module not loaded");
        }

        if (arr instanceof Float32Array) {
            const ptr = this._wasm.__newArray(this._wasm.Float32Array_ID(), arr);
            const resultPtr = this._wasm.volt_To_dB_32(ptr);
            return this._wasm.__getFloat32Array(resultPtr);
        } else if (arr instanceof Float64Array) {
            const ptr = this._wasm.__newArray(this._wasm.Float64Array_ID(), arr);
            const resultPtr = this._wasm.volt_To_dB_64(ptr);
            return this._wasm.__getFloat64Array(resultPtr);
        }

        throw new Error("Unsupported array type. Only Float32Array and Float64Array are supported.");
    }

    voltsToDbBatch(arr, reference = 1.0) {
        if (!this._wasmLoaded) {
            throw new Error("WASM module not loaded");
        }

        if (arr[0] instanceof Float32Array) {
            const innerId = this._wasm.Float32Array_ID();
            const outerId = this._wasm.ArrayFloat32Array_ID();

            const innerPtrs = arr.map(innerArr => this._wasm.__pin(this._wasm.__newArray(innerId, innerArr)));
            const outerPtr = this._wasm.__pin(this._wasm.__newArray(outerId, innerPtrs));

            const resultPtr = this._wasm.volt_To_dB_32_batch(outerPtr);

            const resultPtrs = this._wasm.__getArray(resultPtr);
            const resultArrays = resultPtrs.map(ptr => this._wasm.__getFloat32Array(ptr));

            this._wasm.__unpin(outerPtr);

            return resultArrays;
        } else if (arr[0] instanceof Float64Array) {
            const innerId = this._wasm.Float64Array_ID();
            const outerId = this._wasm.ArrayFloat64Array_ID();

            const innerPtrs = arr.map(innerArr => this._wasm.__pin(this._wasm.__newArray(innerId, innerArr)));
            const outerPtr = this._wasm.__pin(this._wasm.__newArray(outerId, innerPtrs));

            const resultPtr = this._wasm.volt_To_dB_64_batch(outerPtr);

            const resultPtrs = this._wasm.__getArray(resultPtr);
            const resultArrays = resultPtrs.map(ptr => this._wasm.__getFloat64Array(ptr));

            this._wasm.__unpin(outerPtr);

            return resultArrays;
        }

        throw new Error("Unsupported array of array type. Only Float32Array and Float64Array are supported as inner arrays.");
    }

}
