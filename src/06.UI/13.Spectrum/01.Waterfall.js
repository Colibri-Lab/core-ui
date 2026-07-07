Colibri.UI.Spectrum.Waterfall = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.Spectrum.Waterfall']);

        this.AddClass('colibri-ui-spectrum-waterfall');

        this._dataType = Float32Array;

        this._points = 1000;
        this._limit = 1000;

        this.GenerateChildren(element, this);

        this._canvas = Element.create('canvas').appendTo(this._element);
        this._ctx = this._canvas.getContext('bitmaprenderer');

        if (!this._ctx) {
            throw new Error("2D context not supported");
        }

        this._wasm = new Colibri.Modules.Waterfall(null, {});
        this._wasm.AddHandler('Loaded', this.__wasmLoaded, false, this);

    }
    
    Resize(width, height) {
        this._points = width;
        this._limit = height;
        this._wasm.Resize(this._points, this._limit);
    }


    __wasmLoaded() {

        // const dpr = window.devicePixelRatio || 1;

        // const width = Math.round(this._wasm.width * dpr);
        // const height = Math.round(this._wasm.height * dpr);

        // if (this._canvas.width !== width || this._canvas.height !== height) {
        //     this._canvas.width = width;
        //     this._canvas.height = height;
        // }

    }

    /**
     * Draw the line
     * @param {{time: BigInt, delta: Number, chunk: Float32Array}} data float array
     * @returns 
     */
    Draw(data) {
        if (!this._wasm.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }
        this._wasm.Add(data.time, data.duration, data.chunk);
        this.drawTo(this._ctx);
    }

    DrawMultiple(array) {
        if (!this._wasm.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }

        for (const row of array) {
            this.Draw(row);
        }
    }

    Clear() {
        if (!this._wasm.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }

        this._wasm.clear();
    }

    /** Нарисовать весь буфер в 2d-контекст канваса. */
    drawTo(ctx) {
        const imageData = this._wasm.getImageData();
        createImageBitmap(imageData).then((bitmap) => {
            ctx.transferFromImageBitmap(bitmap);
        });
        // ctx.putImageData(imageData, dx, dy);
    }

    /**
     * Points in every row  
     * @type {Number}
     */
    get points() {
        return this._points;
    }
    /**
     * Points in every row
     * @type {Number}
     */
    set points(value) {
        value = this._convertProperty('Number', value);
        this._points = value;
        this.Resize(this._points, this._limit);
    }

    /**
     * Rows limit in history
     * @type {Number}
     */
    get limit() {
        return this._limit;
    }
    /**
     * Rows limit in history
     * @type {Number}
     */
    set limit(value) {
        value = this._convertProperty('Number', value);
        this._limit = value;
        this.Resize(this._points, this._limit);
    }

    ResizeArea(points, limit) {
        points = this._convertProperty('Number', points);
        limit = this._convertProperty('Number', limit);
        this._points = points;
        this._limit = limit;
        this.Resize(this._points, this._limit);
    }

    
    GenerateValues(points, start_x, delta_x, valueDataType = Float64Array) {
        this._start_x = start_x;
        this._delta_x = delta_x;
        const values = new valueDataType(points);
        for(let i = 0; i < points; i++) {
            values[i] = start_x + i * delta_x;
        }
        this.xAxisValues = values;

    }

    Reorganize(minValue, maxValue) {

        if(!this._floatArray) {
            this._floatArray = new this._dataType(this._xAxisValues.length);
        }

        let startIndex = this._xAxisValues.findByValue(minValue);
        let endIndex = this._xAxisValues.findByValue(maxValue);

        if(startIndex === -1) {
            const firstValue = this._xAxisValues[0];
            if(minValue < firstValue && this._delta_x > 0) {
                const prependCount = Math.ceil((firstValue - minValue) / this._delta_x);
                this._xAxisValues = this._xAxisValues.prependTo(this._xAxisValues.length + prependCount, (i) => {
                    return firstValue - (prependCount - i) * this._delta_x;
                });
                if(Object.isPlainObject(this._floatArray)) {
                    for(const name in this._floatArray) {
                        this._floatArray[name] = this._floatArray[name].prependTo(this._floatArray[name].length + prependCount);
                    }
                } else {
                    this._floatArray = this._floatArray.prependTo(this._floatArray.length + prependCount);
                }
                startIndex = this._xAxisValues.findByValue(minValue);
            }
        }

        if(endIndex === -1) {
            const lastValue = this._xAxisValues[this._xAxisValues.length - 1];
            if(maxValue > lastValue && this._delta_x > 0) {
                const appendCount = Math.ceil((maxValue - lastValue) / this._delta_x);
                const len = this._xAxisValues.length;
                this._xAxisValues = this._xAxisValues.appendTo(this._xAxisValues.length + appendCount, (i) => {
                    return lastValue + (i - (len - 1)) * this._delta_x;
                });
                if(Object.isPlainObject(this._floatArray)) {
                    for(const name in this._floatArray) {
                        this._floatArray[name] = this._floatArray[name].appendTo(this._floatArray[name].length + appendCount);
                    }
                } else {
                    this._floatArray = this._floatArray.appendTo(this._floatArray.length + appendCount);
                }
                endIndex = this._xAxisValues.findByValue(maxValue);
            }

        }

        this.Resize(startIndex, endIndex);
    }


}