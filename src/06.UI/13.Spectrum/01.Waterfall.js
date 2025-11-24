
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

        this._currentRow = 0;
        this._selectionMode = 'none';

        this.handleResize = true;
        this.AddHandler('Resize', this.ResizeCanvas, false, this);

        this._length = 1000;
        this._palette = this._createPalette();
        this._row = 0;
        this._history = new Colibri.Common.History(this._length);

        this.enablePointerControl = true;

        this.AddHandler('PointerControlStart', this.__thisPointerControlStart);
        this.AddHandler('PointerControlEnd', this.__thisPointerControlEnd);
        this.AddHandler('PointerControlMove', this.__thisPointerControlMove);

        this.AddHandler('Shown', this.__thisShown);

        this._initGL();
    }

    _createPalette() {
        const palette = new Array(256);
        for (let i = 0; i < 256; i++) {
            const hue = 240 - (i * 240 / 255);
            const s = 1.0;
            const l = 0.5;
            palette[i] = [hue, s, l]; // формат [h, s, l] для использования в шейдере
        }
        return palette;
    }


    _initGL() {
        const gl = this._ctx;

        // создаем шейдеры
        const vsSource = `#version 300 es
        in vec2 a_position;
        in float a_value;
        uniform float u_min;
        uniform float u_max;
        uniform float u_width;
        uniform float u_height;
        out float v_value;
        void main() {
            float x = (a_position.x / u_width) * 2.0 - 1.0;
            float y = (a_position.y / u_height) * 2.0 - 1.0;
            gl_Position = vec4(x, -y, 0, 1);
            v_value = a_value;
        }`;

        const fsSource = `#version 300 es
        precision highp float;
        in float v_value;
        uniform float u_min;
        uniform float u_max;
        out vec4 outColor;
        vec3 hsl2rgb(vec3 hsl) {
            float c = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;
            float x = c * (1.0 - abs(mod(hsl.x / 60.0, 2.0) - 1.0));
            float m = hsl.z - c/2.0;
            vec3 rgb;
            if(hsl.x < 60.0) rgb = vec3(c,x,0.0);
            else if(hsl.x < 120.0) rgb = vec3(x,c,0.0);
            else if(hsl.x < 180.0) rgb = vec3(0.0,c,x);
            else if(hsl.x < 240.0) rgb = vec3(0.0,x,c);
            else if(hsl.x < 300.0) rgb = vec3(x,0.0,c);
            else rgb = vec3(c,0.0,x);
            return rgb + vec3(m);
        }
        void main() {
            float norm = clamp((v_value - u_min)/(u_max - u_min), 0.0, 1.0);
            float hue = 240.0 - norm * 240.0;
            vec3 rgb = hsl2rgb(vec3(hue, 1.0, 0.5));
            outColor = vec4(rgb,1.0);
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
        this._uWidth = gl.getUniformLocation(this._program, 'u_width');
        this._uHeight = gl.getUniformLocation(this._program, 'u_height');

        this._positionBuffer = gl.createBuffer();
        this._valueBuffer = gl.createBuffer();

        gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    Draw(floatArray, show = true) {
        if (!floatArray || floatArray.length === 0) return;
        this._history.add(floatArray);

        if (show) this.ShowBuffer();
    }

    ShowBuffer() {
        const gl = this._ctx;
        const bounds = this._canvas.bounds();
        const width = bounds.outerWidth;
        const height = bounds.outerHeight;

        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this._program);
        gl.uniform1f(this._uMin, this._min);
        gl.uniform1f(this._uMax, this._max);
        gl.uniform1f(this._uWidth, width);
        gl.uniform1f(this._uHeight, height);

        let row = 0;
        const allData = this._history.getAll().reverse();

        for (const floatArray of allData) {
            if(!floatArray) {
                continue;
            }
            
            const positions = new Float32Array(floatArray.length * 2);
            const values = new Float32Array(floatArray.length);
            for (let i = 0; i < floatArray.length; i++) {
                positions[i * 2] = i;
                positions[i * 2 + 1] = row;
                values[i] = floatArray[i];
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STREAM_DRAW);
            gl.enableVertexAttribArray(this._aPosition);
            gl.vertexAttribPointer(this._aPosition, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._valueBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, values, gl.STREAM_DRAW);
            gl.enableVertexAttribArray(this._aValue);
            gl.vertexAttribPointer(this._aValue, 1, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.POINTS, 0, floatArray.length);

            row++;
        }
    }

    ResizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this._canvas.getBoundingClientRect();
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this.ShowBuffer();
    }

    Clear() {
        const gl = this._ctx;
        const bounds = this._canvas.bounds();
        gl.viewport(0, 0, bounds.outerWidth, bounds.outerHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this._history.clear();
    }

}
