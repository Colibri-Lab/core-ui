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

        // off-canvas только для хранения пикселей
        this._off = new OffscreenCanvas(width, maxRows);
        this._offCtx = this._off.getContext('2d', {willReadFrequently: true});

        this._currentIndex = 0;
    }

    resize(width, maxRows) {
        this._off.width = width;
        this._off.height = maxRows;
    }


    /**
     * freqArray — массив чисел 0..255 длиной width
     */
    push(freqArray, gradientMethod) {
        const grad = gradientMethod(this._offCtx, freqArray);
        this._offCtx.fillStyle = grad;
        this._offCtx.fillRect(0, this._currentIndex, this.width, 1);
        this._currentIndex++;
        if (this._currentIndex >= this.maxRows) {
            const imageData = this._offCtx.getImageData(0, 1, this.width, this.maxRows - 1);
            this._offCtx.putImageData(imageData, 0, 0);
            this._currentIndex--;
        }
    }

    get ctx() {
        return this._offCtx;
    }

    clear() {
        this._offCtx.clearRect(0, 0, this.width, this.maxRows);
        this._currentIndex = 0;
    }

    destructor() {
        this.clear();
    }


    /**
     * Рисует диапазон строк [startIndex .. endIndex] включительно
     * startIndex и endIndex — индексы логические (0 — самая старая строка)
     * endIndex >= startIndex
     */
    draw(ctx, width, height, start = 0, end = this.width, startIndex = 0, endIndex = this.maxRows) {
        ctx.drawImage(
            this._off, 
            start, this.maxRows - (startIndex || 0), end, this.maxRows - (endIndex || 0), 
            0, 0, width, height
        );
        
    }

}