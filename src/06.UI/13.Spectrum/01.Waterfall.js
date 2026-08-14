/**
 * Waterfall spectrum component
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Spectrum
 */
Colibri.UI.Spectrum.Waterfall = class extends Colibri.UI.FlexBox {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     * @param {Element} element element of component
     */
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
    
    /**
     * Resize the canvas and the WASM module
     * @param {Number} width width of canvas
     * @param {Number} height height of canvas
     * @public
     */
    Resize(width, height) {
        this._points = width;
        this._limit = height;
        this._wasm.Resize(this._points, this._limit);
    }

    /**
     * WASM module loaded
     * @private
     */
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
     * @param {{time: BigInt, duration: Number, chunk: Float32Array}} data float array
     * @returns {void}
     * @public
     */
    Draw(data) {
        if (!this._wasm.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }
        this._wasm.Add(data.time, data.duration, data.chunk);
        this.drawTo(this._ctx);
    }

    /**
     * Draw multiple lines
     * @param {Array<{time: BigInt, duration: Number, chunk: Float32Array}>} array array of float arrays
     * @public
     */
    DrawMultiple(array) {
        if (!this._wasm.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }

        for (const row of array) {
            this.Draw(row);
        }
    }

    /**
     * Clear the canvas and the WASM module
     * @public
     */
    Clear() {
        if (!this._wasm.loaded) {
            console.warn("WASM module not loaded yet");
            return;
        }

        this._wasm.clear();
    }

    /** 
     * Draw the entire buffer to the 2D context of the canvas. 
     * @param {CanvasRenderingContext2D} ctx 2D context of the canvas
     * @protected
     */
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

    /**
     * Resize the canvas and the WASM module
     * @param {Number} points points in every row
     * @param {Number} limit rows limit in history
     * @public
     */
    ResizeArea(points, limit) {
        points = this._convertProperty('Number', points);
        limit = this._convertProperty('Number', limit);
        this._points = points;
        this._limit = limit;
        this.Resize(this._points, this._limit);
    }

    /**
     * Generate X axis values
     * @param {Number} points points in every row
     * @param {Number} start_x start value of X axis
     * @param {Number} delta_x delta value of X axis
     * @param {Function} valueDataType data type of X axis values
     * @public
     */
    GenerateValues(points, start_x, delta_x, valueDataType = Float64Array) {
        this._start_x = start_x;
        this._delta_x = delta_x;
        const values = new valueDataType(points);
        for(let i = 0; i < points; i++) {
            values[i] = start_x + i * delta_x;
        }
        this.xAxisValues = values;

    }

    /**
     * Reorganize the X axis values and the WASM module
     * @param {Number} minValue minimum value of X axis
     * @param {Number} maxValue maximum value of X axis
     * @public
     */
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