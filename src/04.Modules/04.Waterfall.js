
/**
 * Represents Colibri.Modules.Waterfall class, which provides waterfall visualization using WebAssembly (WASM).
 * @class 
 * @memberof Colibri.Modules
 */
Colibri.Modules.Waterfall = class extends Colibri.Common.Wasm {

    /**
     * Constructs an instance of the Colibri.Modules.Waterfall class.
     * @param {number} [initialMemorySize=0] - The initial memory size for the WASM module.
     * @param {Object} [config={}] - Configuration options for the WASM module.
     * @constructor
     */
    constructor(initialMemorySize = 0, config = {}) {
        super('/res/waterfall.wasm');
        this._wasmLoaded = false;
        this.Load(initialMemorySize, config)
        this.AddHandler('Loaded', this.__wasmLoaded, false, this);
    }

    /**
     * Handles the 'Loaded' event of the WASM module.
     * @param {Event} event - The event object.
     * @param {Object} args - Additional arguments for the event.
     * @private
     */
    __wasmLoaded(event, args) {
        this._syncGeometry();
    }

    /**
     * Synchronizes the geometry of the waterfall visualization by updating width, height, chunk pointer, and image pointer.
     * @private
     */
    _syncGeometry() {
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.chunkPtr = this.getChunkPtr();
        this.imagePtr = this.getImagePtr();
    }

    /**
     * Normalizes the given chunk of data to a range between 0 and 1.
     * @param {Float32Array} chunk - The chunk of data to normalize.
     * @returns {Float32Array} - The normalized chunk of data.
     */
    normalizeChunk(chunk) {
        if (!chunk || !chunk.length) {
            return new Float32Array(0);
        }

        let min = Infinity;
        let max = -Infinity;

        for (let i = 0; i < chunk.length; i++) {
            const v = chunk[i];
            if (v < min) min = v;
            if (v > max) max = v;
        }

        if (max === min) {
            return new Float32Array(chunk.length);
        }

        const range = max - min;
        const normalized = new Float32Array(chunk.length);
        for (let i = 0; i < chunk.length; i++) {
            normalized[i] = (chunk[i] - min) / range;
        }

        return normalized;
    }

    /**
     * Resizes the waterfall visualization to the specified width and height.
     * @param {number} width - The new width of the visualization.
     * @param {number} height - The new height of the visualization.
     */
    Resize(width, height) {
        if (!this.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }
        this.resize(width, height);
        this._syncGeometry();
    }

    /**
     * Adds a new row of data to the waterfall visualization.
     * @param {BigInt} time - The timestamp for the new row.
     * @param {number} delta - The delta value for the new row.
     * @param {Float32Array} chunk - The chunk of data to add as a new row.
     */
    Add(time, delta, chunk) {
        if (!this.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }

        const normalizedChunk = this.normalizeChunk(chunk);
        const len = Math.min(normalizedChunk.length, this.width);
        const view = new Float32Array(this.memory.buffer, this.chunkPtr, this.width);
        view.set(len === normalizedChunk.length ? normalizedChunk : normalizedChunk.subarray(0, len));

        const t = time.toBigIntNanoseconds();
        this.addRow(t, delta, len);

    }

    /**
     * Retrieves the image data of the waterfall visualization as an ImageData object.
     * @returns {ImageData} - The ImageData object representing the waterfall visualization.
     */
    getImageData() {
        const bytes = new Uint8ClampedArray(
            this.memory.buffer,
            this.imagePtr,
            this.width * this.height * 4
        );

        const rowSize = this.width * 4;
        const flipped = new Uint8ClampedArray(bytes.length);
        for (let y = 0; y < this.height; y++) {
            const srcOffset = y * rowSize;
            const dstOffset = (this.height - 1 - y) * rowSize;
            flipped.set(bytes.subarray(srcOffset, srcOffset + rowSize), dstOffset);
        }

        // Копия, чтобы ImageData не зависела от последующих изменений памяти wasm.
        return new ImageData(flipped, this.width, this.height);
    }

    /**
     * Retrieves the image data of a specific region of the waterfall visualization as an ImageData object.
     * @param {number} rowStart - The starting row index of the region.
     * @param {number} rowCount - The number of rows to include in the region.
     * @returns {ImageData} - The ImageData object representing the specified region of the waterfall visualization.
     */
    getRegionImageData(rowStart, rowCount) {
        const offset = this.imagePtr + rowStart * this.width * 4;
        const length = rowCount * this.width * 4;
        const bytes = new Uint8ClampedArray(this.memory.buffer, offset, length);
        return new ImageData(new Uint8ClampedArray(bytes), this.width, rowCount);
    }

}
