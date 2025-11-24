/**
 * @classdesc Drag process worker
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.WaterfallBuffer = class extends Destructable {

    constructor(width, maxRows) {
        super();
        this.width = width;
        this.maxRows = maxRows;

        // создаём offscreen-canvas с webgl2
        this._off = new OffscreenCanvas(width, maxRows);
        this._gl = this._off.getContext('webgl2', { preserveDrawingBuffer: true });

        if (!this._gl) {
            throw new Error("WebGL2 not supported");
        }

        this._currentIndex = 0;

        this._initGL();
    }

    _initGL() {
        const gl = this._gl;

        // создаём текстуру для хранения спектра
        this._tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.maxRows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_2D, null);

        // буфер для строки
        this._rowRGBA = new Uint8Array(this.width * 4);
    }

    resize(width, maxRows) {
        this.width = width;
        this.maxRows = maxRows;
        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, this._tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, maxRows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this._rowRGBA = new Uint8Array(width * 4);
    }

    /**
     * freqArray — массив чисел 0..255 длиной width
     */
    push(freqArray, palette = null) {
        const gl = this._gl;
        const y = this._currentIndex;

        for (let x = 0; x < this.width; x++) {
            const v = freqArray[x] || 0;
            const n = Math.max(0, Math.min(1, v / 255)); // нормируем

            let r, g, b, a = 255;

            if (palette && palette.length > 0) {
                // индекс в палитре
                const idx = Math.floor(n * (palette.length - 1));
                const color = palette[idx];

                // ожидаем массив [r,g,b] или [r,g,b,a]
                r = color[0];
                g = color[1];
                b = color[2];
                a = color.length > 3 ? color[3] : 255;
            } else {
                // дефолтный переход: от синего к красному
                r = Math.floor(n * 255);
                g = 0;
                b = Math.floor((1 - n) * 255);
            }

            const p = x * 4;
            this._rowRGBA[p] = r;
            this._rowRGBA[p + 1] = g;
            this._rowRGBA[p + 2] = b;
            this._rowRGBA[p + 3] = a;
        }

        // загружаем строку в текстуру
        gl.bindTexture(gl.TEXTURE_2D, this._tex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, y, this.width, 1, gl.RGBA, gl.UNSIGNED_BYTE, this._rowRGBA);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this._currentIndex++;
        if (this._currentIndex >= this.maxRows) {
            this._currentIndex = 0; // циклический буфер
        }
    }


    clear() {
        const gl = this._gl;
        const empty = new Uint8Array(this.width * this.maxRows * 4);
        gl.bindTexture(gl.TEXTURE_2D, this._tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.maxRows, 0, gl.RGBA, gl.UNSIGNED_BYTE, empty);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this._currentIndex = 0;
    }

    destructor() {
        this.clear();
        const gl = this._gl;
        gl.deleteTexture(this._tex);
    }

    /**
     * draw — здесь нужно использовать шейдеры для отображения текстуры
     * ctx — это WebGL2RenderingContext, а не 2D
     */
    /**
 * Рисует диапазон строк [startIndex .. endIndex] включительно
 * startIndex и endIndex — индексы логические (0 — самая старая строка)
 * endIndex >= startIndex
 */
    draw(ctx, width, height, start = 0, end = this.width, startIndex = 0, endIndex = this.maxRows) {
        if (start < 0) start = 0;
        if (end > this.width) end = this.width;
        if (startIndex < 0) startIndex = 0;
        if (endIndex > this.maxRows) endIndex = this.maxRows;

        const gl = this._gl;

        const sx = start;
        const sw = end - start;
        const sh = endIndex - startIndex;
        const sy = startIndex;

        // читаем пиксели из WebGL текстуры
        const pixels = new Uint8Array(sw * sh * 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.readPixels(sx, sy, sw, sh, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // создаём ImageData
        const imageData = new ImageData(sw, sh);
        imageData.data.set(pixels);

        // рисуем в 2D‑canvas, масштабируя до нужных размеров
        const tmpCanvas = new OffscreenCanvas(sw, sh);
        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCtx.putImageData(imageData, 0, 0);

        ctx.drawImage(tmpCanvas, 0, 0, width, height);
    }
}