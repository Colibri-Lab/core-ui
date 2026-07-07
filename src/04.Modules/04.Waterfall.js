

Colibri.Modules.Waterfall = class extends Colibri.Common.Wasm {

    _wasm = null;

    constructor(initialMemorySize = 0, config = {}) {
        super('/res/waterfall.wasm');
        this._wasmLoaded = false;
        this.Load(initialMemorySize, config)
        this.AddHandler('Loaded', this.__wasmLoaded, false, this);
    }

    __wasmLoaded(event, args) {
        this._syncGeometry();
    }

    _syncGeometry() {
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.chunkPtr = this.getChunkPtr();
        this.imagePtr = this.getImagePtr();
    }

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

    Resize(width, height) {
        if (!this.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }
        this.resize(width, height);
        this._syncGeometry();
    }

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
     * Весь буфер как ImageData (WIDTH x HEIGHT).
     * memory.buffer запрашивается заново при каждом вызове, т.к. память wasm
     * может расти (грерастание отсоединяет старый ArrayBuffer).
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
     * Часть буфера — rowCount строк, начиная с rowStart (0 — самая старая строка,
     * HEIGHT-1 — самая новая). Полезно, если нужно перерисовать не весь canvas,
     * а только видимую/изменившуюся область.
     */
    getRegionImageData(rowStart, rowCount) {
        const offset = this.imagePtr + rowStart * this.width * 4;
        const length = rowCount * this.width * 4;
        const bytes = new Uint8ClampedArray(this.memory.buffer, offset, length);
        return new ImageData(new Uint8ClampedArray(bytes), this.width, rowCount);
    }

}
