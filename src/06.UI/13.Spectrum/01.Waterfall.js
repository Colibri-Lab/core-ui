Colibri.UI.Spectrum.Waterfall = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.Spectrum.Waterfall']);

        this.AddClass('colibri-ui-spectrum-waterfall');

        this._dataType = Float32Array;

        this.GenerateChildren(element, this);

        this._canvas = Element.create('canvas').appendTo(this._element);
        this._ctx = this._canvas.getContext('2d');

        if (!this._ctx) {
            throw new Error("2D context not supported");
        }

        this._length = 1000;
        this._points = 2000;

        this._wasm = new Colibri.Modules.Waterfall(this._length * this._points, { length: this._length, points: this._points });
        this._wasm.AddHandler('Loaded', this.__wasmLoaded, false, this);


    }

    __wasmLoaded(event, args) {
        console.log('loaded !!!');
        const bcr = this._canvas.getBoundingClientRect();
        this._mem = new Uint32Array(this._wasm.memory.buffer);
        var width = bcr.width >>> 1;
        var height = bcr.height >>> 1;
        var size = width * height;

        Colibri.Common.Wait(() => !!width).then(() => {
            // Update about 30 times a second
            const update = () => {
                setTimeout(update, 1000 / 30);
                this._mem.copyWithin(0, size, 2 * size);
                console.log(this._mem);
            }
            update();


            var imageData = this._ctx.createImageData(width, height);
            var argb = new Uint32Array(imageData.data.buffer);

            const render = () => {
                requestAnimationFrame(render);
                argb.set(this._mem.subarray(size, 2 * size)); // copy output to image buffer
                // console.log(argb);
                this._ctx.putImageData(imageData, 0, 0);      // apply image buffer
            };
            render();
                
        });

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

        this._wasm.Add(data.time, data.delta, data.chunk);

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

}