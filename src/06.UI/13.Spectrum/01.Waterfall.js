Colibri.UI.Spectrum.Waterfall = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.Spectrum.Waterfall']);

        this.AddClass('colibri-ui-spectrum-waterfall');

        this._dataType = Float32Array;

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

        this._historyClass = 'Colibri.Common.History';
        const cls = eval(this._historyClass);
        this._history = new cls(this._length, true);

        this._startIndex = 0;
        this._endIndex = this._length;

        this.AddHandler('PointerControlStart', this.__thisPointerControlStart);
        this.AddHandler('PointerControlEnd', this.__thisPointerControlEnd);
        this.AddHandler('PointerControlMove', this.__thisPointerControlMove);

        this.AddHandler('Shown', this.__thisShown);

        this._selections.AddHandler('ContextMenu', this.__thisBubble, false, this);
        this._selections.AddHandler('ContextMenuItemClicked', this.__thisBubble, false, this);

        this._initGL();
        this._initQuad();
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


    /* ===================== HISTORY ===================== */

    get history() {
        return this._history.getAll();
    }

    set history(value) {
        this._history.setAll(value);
        this.Redraw();
    }

    /**
     * Class of history
     * @type {String}
     */
    get historyClass() {
        return this._historyClass;
    }

    /**
     * Class of history
     * @type {String}
     */
    set historyClass(value) {
        this._historyClass = value;
        const cls = eval(this._historyClass);
        if (!(this._history instanceof cls)) {
            this._history = new cls(this._length, true);
        }
    }

    /* ===================== DATA TYPE ===================== */

    set dataType(value) {
        value = this._convertProperty('Function', value);
        this._dataType = value;
    }

    get dataType() {
        return this._dataType;
    }

    /* ===================== MIN / MAX ===================== */

    /** Minimum date value */
    get min() { return this._min; }
    set min(value) {
        this._min = value;
        this.Redraw();
    }

    /** Maximum date value */
    get max() { return this._max; }
    set max(value) {
        this._max = value;
        this.Redraw();
    }

    /** Rearrange dates from min to max */
    Rearrange(min, max) {
        this.min = min;
        this.max = max;
        this.Redraw();
    }

    /* ===================== INDEXING ===================== */

    get startIndex() { return this._startIndex; }
    set startIndex(v) {
        this._startIndex = parseInt(v);
        this.Redraw();
    }

    get endIndex() { return this._endIndex; }
    set endIndex(v) {
        this._endIndex = parseInt(v);
        this.Redraw();
    }

    /** Resize vertical range */
    ResizeVertical(start, end) {
        this._startIndex = parseInt(start);
        this._endIndex = parseInt(end);
        this.Redraw();
    }


    /**
     * Start index for every history row to crop
     * @type {Number}
     */
    get start() {
        return this._start;
    }
    /**
     * Start index for every history row to crop
     * @type {Number}
     */
    set start(value) {
        value = this._convertProperty('Number', value);
        this._start = parseInt(value);
        this.Redraw();
    }

    /**
     * End index for every history row to crop
     * @type {Number}
     */
    get end() {
        return this._end;
    }
    /**
     * End index for every history row to crop
     * @type {Number}
     */
    set end(value) {
        value = this._convertProperty('Number', value);
        this._end = parseInt(value);
        this.Redraw();
    }

    /** Resize waterfall width from start index to end */
    Resize(start, end) {
        this._start = parseInt(start);
        this._end = parseInt(end);
        this.Redraw();
    }

    /* ===================== SELECTION ===================== */

    /** Selection mode */
    get selectionMode() {
        return this._selectionMode;
    }

    /** Selection mode */
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

    __thisPointerControlStart(event, args) {
        if (this.selectionMode !== 'none') {
            this._selection = this._selections.Add(args.point, this._selectionMode, document.keysPressed.ctrl);
        } else {
            this.cursor = 'grab';
            this.Dispatch('GrabStart', args);
        }
    }

    __thisPointerControlEnd(event, args) {
        if (this.selectionMode !== 'none') {
            if (args.rect.width === 0 || args.rect.height === 0) {
                this._selections.Remove(this._selection);
            } else {
                this._selections.Update(this._selection, args.rect);
            }
        } else {
            this.cursor = 'default';
            this.Dispatch('GrabEnd', args);
        }
    }

    __thisPointerControlMove(event, args) {
        if (this._selectionMode !== 'none') {
            this._selections.Update(this._selection, args.rect);
        } else {
            this.cursor = 'grabbing';
            this.Dispatch('Grabbing', args);
        }
    }

    Clear() {
        this._history.clear();
        this.Redraw();
    }

    ResizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const r = this._canvas.getBoundingClientRect();

        this._canvas.width = r.width * dpr;
        this._canvas.height = r.height * dpr;

        this.Redraw();
    }

    /* ===================== DRAW ===================== */

    Draw(data, show = true) {
        if (Array.isArray(data)) {
            this._history.add(data);
        } else {
            this._history.addObject(data);
        }

        if (show) this.Redraw();
    }


    /**
     * Normalization function
     * @type {Function}
     */
    get normalizationFunction() {
        return this._normalizationFunction;
    }
    /**
     * Normalization function
     * @type {Function}
     */
    set normalizationFunction(value) {
        value = this._convertProperty('Function', value);
        this._normalizationFunction = value;
    }
    /* ===================== PALETTE ===================== */

    get palette() {
        return this._palette;
    }

    set palette(palette) {
        this._palette = new Uint8ClampedArray(palette);
        this._paletteSize = this._palette.length / 4;
        this._uploadPalette();
    }

    _createPalette() {
        this._palette = new Uint8ClampedArray([
            255, 255, 255, 255,
            0, 0, 255, 255,
            0, 255, 0, 255,
            255, 0, 0, 255
        ]);
        this._paletteSize = this._palette.length / 4;
    }

    _uploadPalette() {
        const gl = this._ctx;

        if (!this._paletteTexture) {
            this._paletteTexture = gl.createTexture();
        }

        gl.bindTexture(gl.TEXTURE_2D, this._paletteTexture);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this._paletteSize,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            this._palette
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        console.log("WebGL2:", gl instanceof WebGL2RenderingContext);
        console.log("FLOAT texture support:", gl.getExtension("EXT_color_buffer_float"));
        console.log("RED:", gl.RED, "R32F:", gl.R32F);
    }

    /* ===================== INIT GL ===================== */

    _initGL() {
        const gl = this._ctx;

        const vs = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

        const fs = `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_uv;

uniform sampler2D u_data;
uniform sampler2D u_palette;

out vec4 outColor;

void main() {
    float v = texture(u_data, v_uv).r;
    v = clamp(v, 0.0, 1.0);

    vec4 color = texture(u_palette, vec2(v, 0.5));
    outColor = color;
}`;

        const compile = (src, type) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);

            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(s));
                throw new Error("Shader compile failed");
            }

            return s;
        };

        const p = gl.createProgram();
        gl.attachShader(p, compile(vs, gl.VERTEX_SHADER));
        gl.attachShader(p, compile(fs, gl.FRAGMENT_SHADER));
        gl.linkProgram(p);

        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(p));
            throw new Error("Program link failed");
        }

        this._program = p;

        this._aPosition = gl.getAttribLocation(p, "a_position");
        this._uData = gl.getUniformLocation(p, "u_data");
        this._uPalette = gl.getUniformLocation(p, "u_palette");

        this._texture = gl.createTexture();
        this._paletteTexture = gl.createTexture();
    }

    _initQuad() {
        const gl = this._ctx;

        this._quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._quad);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);
    }

    /* ===================== CORE RENDER ===================== */

    Redraw() {
        const gl = this._ctx;

        // --- resize ONLY if needed ---
        const dpr = window.devicePixelRatio || 1;
        const rect = this._canvas.getBoundingClientRect();

        const width = Math.round(rect.width * dpr);
        const height = Math.round(rect.height * dpr);

        if (this._canvas.width !== width || this._canvas.height !== height) {
            this._canvas.width = width;
            this._canvas.height = height;
        }

        // --- viewport MUST match drawing buffer ---
        gl.viewport(0, 0, this._canvas.width, this._canvas.height);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this._program);

        const all = this._history.getAll();

        const start = Math.max(0, this._startIndex || 0);
        const end = Math.min(all.length, this._endIndex || this._length);

        const rows = Math.max(1, end - start);
        const cols = this._length;

        const data = new Float32Array(rows * cols);

        let offset = 0;

        for (let i = start; i < end; i++) {
            const chunk = all[i]?.chunk;

            for (let j = 0; j < cols; j++) {
                const v = chunk?.[j] ?? 0;
                data[offset + j] = this._normalizationFunction(v);
            }

            offset += cols;
        }

        // --- texture upload ---
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.R32F,
            cols,
            rows,
            0,
            gl.RED,
            gl.FLOAT,
            data
        );

        gl.uniform1i(this._uData, 0);

        // --- palette ---
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._paletteTexture);
        gl.uniform1i(this._uPalette, 1);

        // --- quad ---
        gl.bindBuffer(gl.ARRAY_BUFFER, this._quad);
        gl.enableVertexAttribArray(this._aPosition);
        gl.vertexAttribPointer(this._aPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

};