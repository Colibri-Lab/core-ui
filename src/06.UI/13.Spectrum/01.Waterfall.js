
/**
 * Waterfall spectrum viewer
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Spectrum
 */
Colibri.UI.Spectrum.Waterfall = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.Spectrum.Waterfall']);
        this.AddClass('colibri-ui-spectrum-waterfall');

        this.GenerateChildren(element, this);

        this._canvas = Element.create('canvas').appendTo(this._element);
        this._ctx = this._canvas.getContext('webgl2', { preserveDrawingBuffer: true });
        if (!this._ctx) {
            throw new Error("WebGL2 not supported");
        }
       

        this._selections = new Colibri.UI.Spectrum.Selections('selections', this);
        this._selections.shown = true;
        this._selectionMode = 'none';

        this.enablePointerControl = true;

        this.handleResize = true;
        this.AddHandler('Resize', this.ResizeCanvas, false, this);

        this._length = 1000;
        this._createPalette();
        this._uploadPalette();
        this._row = 0;
        this._history = new Colibri.Common.History(this._length, true);

        this.AddHandler('PointerControlStart', this.__thisPointerControlStart);
        this.AddHandler('PointerControlEnd', this.__thisPointerControlEnd);
        this.AddHandler('PointerControlMove', this.__thisPointerControlMove);

        this.AddHandler('Shown', this.__thisShown);

        this._selections.AddHandler('ContextMenu', this.__thisBubble, false, this);
        this._selections.AddHandler('ContextMenuItemClicked', this.__thisBubble, false, this);

        this._initGL();
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('GrabStart', false, 'When graph is grabbed');
        this.RegisterEvent('Grabbing', false, 'When graph is grabbed');
        this.RegisterEvent('GrabEnd', false, 'When graph is grabbed');
    }

    /**
     * Selections object
     * @type {Colibri.UI.Spectrum.Selections}
     * @readonly
     */
    get Selections() {
        return this._selections;
    }

    __thisPointerControlStart(event, args) {
        if (this.selectionMode != 'none') {
            this._selection = this.Selections.Add(args.point, this._selectionMode, document.keysPressed.ctrl);
        } else {
            this.cursor = 'grab';
            this.Dispatch('GrabStart', args);
        }
    }

    __thisPointerControlEnd(event, args) {
        if (this.selectionMode != 'none') {
            if (args.rect.width === 0 || args.rect.height === 0) {
                this.Selections.Remove(this._selection);
            } else {
                this.Selections.Update(this._selection, args.rect);

            }
        } else {
            this.cursor = 'default';
            this.Dispatch('GrabEnd', args);
        }
    }

    __thisPointerControlMove(event, args) {
        if (this._selectionMode !== 'none') {
            this.Selections.Update(this._selection, args.rect);
        } else {
            this.cursor = 'grabbing';
            this.Dispatch('Grabbing', args);
        }
    }

    
    /**
     * Selection mode
     * @type {none,select-column,select-row,select-rect}
     */
    get selectionMode() {
        return this._selectionMode;
    }
    /**
     * Selection mode
     * @type {none,select-column,select-row,select-rect}
     */
    set selectionMode(value) {
        this._selectionMode = value;
        switch (value) {
            case 'select-column':
                this.cursor = 'col-resize';
                break;
            case 'select-row':
                this.cursor = 'row-resize';
                break;
            case 'select-rect':
                this.cursor = 'crosshair';
                break;
            default:
                this.cursor = 'default';
        }
    }

    /**
     * Color for the clear space
     * @type {String}
     */
    get clearColor() {
        return this._clearColor;
    }
    /**
     * Color for the clear space
     * @type {String}
     */
    set clearColor(value) {
        this._clearColor = value;
        const rgb = Colibri.UI.Rgb.Create().fromHex(value);
        const palette = this.palette
        palette[0] = rgb.red;
        palette[1] = rgb.green;
        palette[2] = rgb.blue;
        palette[3] = rgb.alpha;
        this.palette = palette;
    }

    get palette() {
        return this._palette;
    }

    set palette(palette) {
        // options.interpolate = true|false (nearest vs linear)
        this._paletteInterpolate = true;

        // normalize to Uint8ClampedArray RGBA
        let rgba;
        if (palette instanceof Uint8ClampedArray || palette instanceof Uint8Array) {
            rgba = palette;
        } else if (Array.isArray(palette)) {
            // array may be flattened or array of arrays
            if (palette.length === 0) {
                rgba = new Uint8ClampedArray(0);
            } else if (Array.isArray(palette[0])) {
                // array of [r,g,b,a] or [h,s,l]
                if (palette[0].length === 4) {
                    rgba = new Uint8ClampedArray(palette.length * 4);
                    for (let i = 0; i < palette.length; i++) {
                        const p = palette[i];
                        rgba[i * 4] = p[0];
                        rgba[i * 4 + 1] = p[1];
                        rgba[i * 4 + 2] = p[2];
                        rgba[i * 4 + 3] = p[3] === undefined ? 255 : p[3];
                    }
                } else if (palette[0].length === 3) {
                    // treat as HSL (0..360,0..1,0..1) -> convert to RGB
                    rgba = new Uint8ClampedArray(palette.length * 4);
                    for (let i = 0; i < palette.length; i++) {
                        const hsl = palette[i];
                        const rgb = this._hslToRgb(hsl[0], hsl[1], hsl[2]);
                        rgba[i * 4] = Math.round(rgb[0] * 255);
                        rgba[i * 4 + 1] = Math.round(rgb[1] * 255);
                        rgba[i * 4 + 2] = Math.round(rgb[2] * 255);
                        rgba[i * 4 + 3] = 255;
                    }
                } else {
                    rgba = new Uint8ClampedArray(0);
                }
            } else {
                // flattened [r,g,b,a,r,g,b,a,...]
                rgba = new Uint8ClampedArray(palette);
            }
        } else {
            rgba = new Uint8ClampedArray(0);
        }

        this._palette = rgba;
        this._paletteSize = Math.floor(rgba.length / 4);
        this._uploadPalette();
    }

    _hslToRgb(h, s, l) {
        // h: 0..360, s:0..1, l:0..1 -> returns [r,g,b] 0..1
        h = h % 360;
        if (h < 0) h += 360;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const hh = h / 60;
        const x = c * (1 - Math.abs((hh % 2) - 1));
        let r1 = 0, g1 = 0, b1 = 0;
        if (hh >= 0 && hh < 1) { r1 = c; g1 = x; b1 = 0; }
        else if (hh < 2) { r1 = x; g1 = c; b1 = 0; }
        else if (hh < 3) { r1 = 0; g1 = c; b1 = x; }
        else if (hh < 4) { r1 = 0; g1 = x; b1 = c; }
        else if (hh < 5) { r1 = x; g1 = 0; b1 = c; }
        else { r1 = c; g1 = 0; b1 = x; }
        const m = l - c / 2;
        return [r1 + m, g1 + m, b1 + m];
    }

    _uploadPalette() {
        const gl = this._ctx;
        if (!gl) return;

        if (!this._paletteTexture) {
            this._paletteTexture = gl.createTexture();
        }

        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null); // ВАЖНО: отвязать PIXEL_UNPACK_BUFFER
        gl.bindTexture(gl.TEXTURE_2D, this._paletteTexture);

        const width = Math.max(1, this._paletteSize);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            this._palette
        );

        // фильтры
        if (this._paletteInterpolate) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_2D, null);

        // задаём цвет очистки (фон)
        const r = this._palette[0] / 255;
        const g = this._palette[1] / 255;
        const b = this._palette[2] / 255;
        const a = this._palette[3] / 255;
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }


    /* ---------- GL init & shaders ---------- */

    _createPalette() {

        this._palette = new Uint8ClampedArray([
            255, 255, 255, 255, // белый
            224, 224, 255, 255,
            192, 192, 255, 255,
            160, 160, 255, 255,
            128, 128, 255, 255,
            0, 0, 255, 255,
            0, 128, 255, 255,
            0, 255, 255, 255,
            0, 255, 128, 255,
            0, 255, 0, 255,
            128, 255, 0, 255,
            255, 255, 0, 255,
            255, 128, 0, 255,
            255, 0, 0, 255,
        ]);

    }

    /**
     * Minimum value
     * @type {Number}
     */
    get min() {
        return this._min;
    }
    /**
     * Minimum value
     * @type {Number}
     */
    set min(value) {
        value = this._convertProperty('Number', value);
        this._min = value;
        this.Redraw();
    }

    /**
     * Maximum value
     * @type {Number}
     */
    get max() {
        return this._max;
    }
    /**
     * Maximum avlue
     * @type {Number}
     */
    set max(value) {
        value = this._convertProperty('Number', value);
        this._max = value;
        this.Redraw();
    }

    /**
     * Index of start
     * @type {Number}
     */
    get start() {
        return this._start;
    }
    /**
     * Index of start
     * @type {Number}
     */
    set start(value) {
        value = this._convertProperty('Number', value);
        this._start = parseInt(value);
        this.Redraw();
    }


    /**
     * Index of end (in array, must be less or equial than dataarray length)
     * @type {Number}
     */
    get end() {
        return this._end;
    }
    /**
     * Index of end (in array, must be less or equial than dataarray length)
     * @type {Number}
     */
    set end(value) {
        value = this._convertProperty('Number', value);
        this._end = parseInt(value);
        this.Redraw();
    }


    /**
     * Index of start
     * @type {Number}
     */
    get startIndex() {
        return this._startIndex;
    }
    /**
     * Index of start
     * @type {Number}
     */
    set startIndex(value) {
        value = this._convertProperty('Number', value);
        this._startIndex = parseInt(value);
        this.Redraw();
    }


    /**
     * Index of end (in array, must be less or equial than dataarray length)
     * @type {Number}
     */
    get endIndex() {
        return this._endIndex;
    }
    /**
     * Index of end (in array, must be less or equial than dataarray length)
     * @type {Number}
     */
    set endIndex(value) {
        value = this._convertProperty('Number', value);
        this._endIndex = parseInt(value);
        this.Redraw();
    }

    ResizeVertical(start, end) {
        this._startIndex = parseInt(start);
        this._endIndex = parseInt(end);
        this.Redraw();
    }

    get length() {
        return this._length;
    }

    set length(value) {
        value = this._convertProperty('Number', value);
        this._length = value;
        this._history.resize(this._length);
        this.Redraw();
    }

    Resize(start, end) {
        this._start = parseInt(start);
        this._end = parseInt(end);
        this.Redraw();
    }

    Rearrange(min, max) {
        this.min = min;
        this.max = max;
        this.Redraw();
    }

    _initGL() {
        const gl = this._ctx;

        const vsSource = `#version 300 es
        in vec2 a_position;
        in float a_value;
        uniform float u_min;
        uniform float u_max;
        out float v_norm;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_norm = clamp((a_value - u_min) / max(0.00001, (u_max - u_min)), 0.0, 1.0);
        }`;

        const fsSource = `#version 300 es
        precision highp float;
        in float v_norm;
        uniform sampler2D u_palette;
        out vec4 outColor;
        void main() {
            vec2 tc = vec2(v_norm, 0.5);            
            outColor = texture(u_palette, tc);
        }`;

        const compileShader = (source, type) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw new Error('Shader compile failed: ' + gl.getShaderInfoLog(shader));
            }
            return shader;
        };

        const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

        this._program = gl.createProgram();
        gl.attachShader(this._program, vertexShader);
        gl.attachShader(this._program, fragmentShader);
        gl.linkProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            throw new Error('Program link failed: ' + gl.getProgramInfoLog(this._program));
        }

        this._aPosition = gl.getAttribLocation(this._program, 'a_position');
        this._aValue = gl.getAttribLocation(this._program, 'a_value');
        this._uMin = gl.getUniformLocation(this._program, 'u_min');
        this._uMax = gl.getUniformLocation(this._program, 'u_max');
        this._uPalette = gl.getUniformLocation(this._program, 'u_palette');

        this._positionBuffer = gl.createBuffer();
        this._valueBuffer = gl.createBuffer();

        this._paletteSize = Math.floor(this._palette.length / 4);
        this._paletteTexture = gl.createTexture();
        this._uploadPalette();

        gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    Draw(floatArray, show = true) {
        if (!floatArray || floatArray.length === 0) return;
        this._history.add(floatArray);

        if (show) this.Redraw();
    }

    _crop(floatArray) {
        let start = this._start || 0;
        let end = this._end || floatArray.length;
        if (start < 0) start = 0;

        const length = end - start;
        const result = new Float32Array(length); // автоматически заполнен нулями

        const available = Math.min(floatArray.length - start, length);
        if (available > 0) {
            result.set(floatArray.subarray(start, start + available));
        }

        return result;
    }

    _createPaletteTexture() {
        const gl = this._ctx;

        // создаём Float32Array с RGB
        const size = 256;
        const data = new Uint8Array(size * 3);

        for (let i = 0; i < size; i++) {
            const t = i / 255.0;
            const hue = 240.0 - t * 240.0; // синий → красный

            // конвертация HSL → RGB вручную
            const C = 1.0;
            const X = C * (1.0 - Math.abs(((hue / 60.0) % 2.0) - 1.0));
            let r, g, b;
            if (hue < 60) { r = C; g = X; b = 0; }
            else if (hue < 120) { r = X; g = C; b = 0; }
            else if (hue < 180) { r = 0; g = C; b = X; }
            else if (hue < 240) { r = 0; g = X; b = C; }
            else if (hue < 300) { r = X; g = 0; b = C; }
            else { r = C; g = 0; b = X; }

            data[i * 3] = r * 255;
            data[i * 3 + 1] = g * 255;
            data[i * 3 + 2] = b * 255;
        }

        this._paletteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._paletteTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(
            gl.TEXTURE_2D, 0,
            gl.RGB,
            size, 1,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            data
        );
    }

    Redraw() {
        const gl = this._ctx;
        const bounds = this._canvas.bounds();
        const width = bounds.outerWidth;
        const height = bounds.outerHeight;

        this._createPaletteTexture();

        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this._program);
        gl.uniform1f(this._uMin, this._min || 0);
        gl.uniform1f(this._uMax, this._max || 100);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._paletteTexture);
        gl.uniform1i(this._uPalette, 0);
        gl.uniform1f(this._uPaletteSize, this._paletteSize);

        const startIndex = this._startIndex || 0;
        const endIndex = this._endIndex || this._length;
        const allData = this._history.crop(startIndex, endIndex);

        let row = 0;
        for (const i in allData) {
            if (!i.isNumeric()) break;
            let floatArray = this._crop(allData[i]);

            const positions = [];
            const values = [];

            const rowsCount = endIndex - startIndex;
            const colsCount = floatArray.length;

            for (let j = 0; j < floatArray.length; j++) {
                const x0 = j / colsCount * 2 - 1;
                const x1 = (j + 1) / colsCount * 2 - 1;
                const y0 = row / rowsCount * 2 - 1;
                const y1 = (row + 1) / rowsCount * 2 - 1;

                // два треугольника на квадрат
                positions.push(
                    x0, -y0,
                    x1, -y0,
                    x0, -y1,
                    x0, -y1,
                    x1, -y0,
                    x1, -y1
                );

                const v = floatArray[j];
                for (let k = 0; k < 6; k++) values.push(v);
            }

            const posArray = new Float32Array(positions);
            const valArray = new Float32Array(values);


            gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STREAM_DRAW);
            gl.enableVertexAttribArray(this._aPosition);
            gl.vertexAttribPointer(this._aPosition, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._valueBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, valArray, gl.STREAM_DRAW);
            gl.enableVertexAttribArray(this._aValue);
            gl.vertexAttribPointer(this._aValue, 1, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, posArray.length / 2);
            row++;
        }
    }


    ResizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this._canvas.getBoundingClientRect();
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this.Redraw();
    }

    Clear() {
        const gl = this._ctx;
        const bounds = this._canvas.bounds();
        gl.viewport(0, 0, bounds.outerWidth, bounds.outerHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this._history.clear();
    }

    /**
     * History array
     * @type {Array}
     */
    get history() {
        return this._history.getAll();
    }
    /**
     * History array
     * @type {Array}
     */
    set history(value) {
        this._history.setAll(value);
        this.Redraw();
    }

}
