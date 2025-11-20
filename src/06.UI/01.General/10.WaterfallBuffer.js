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
        this._off = document.createElement('canvas');
        this._off.width = width;
        this._off.height = maxRows;
        this._offCtx = this._off.getContext('2d');

        this._currentIndex = 0;       // индекс для новой строки
        this._line = new ImageData(width, 1);
    }

    resize(width, maxRows) {
        this._off.width = width;
        this._off.height = maxRows;
    }


    /**
     * freqArray — массив чисел 0..255 длиной width
     */
    push(freqArray, gradientMethod) {
        // const d = this._line.data;
        // for (let i = 0; i < this.width; i++) {
        //     const v = freqArray[i] | 0;
        //     const p = i * 4;
        //     d[p] = v; d[p + 1] = v; d[p + 2] = v; d[p + 3] = 255;
        // }

        const grad = gradientMethod(this._offCtx, freqArray);
        this._offCtx.fillStyle = grad;
        this._offCtx.fillRect(0, this._currentIndex, this.width, 1);
        // this._offCtx.putImageData(this._line, 0, this._currentIndex);

        this._currentIndex++;
        if (this._currentIndex >= this.maxRows) this._currentIndex = 0;
    }

    /**
     * Возвращает ImageData готовый к рисованию
     * @var {ImageData}
     * @readonly
     */
    get imageData() {

        const w = this.width;
        const h = this.maxRows;
        const fullData = this._offCtx.getImageData(0, 0, w, h);

        // создаём ImageData, где строки идут в правильном порядке
        const result = new ImageData(w, h);
        const rowSize = w * 4;

        // копируем сначала от currentIndex до конца
        const topRows = h - this._currentIndex;
        result.data.set(
            fullData.data.subarray(this._currentIndex * rowSize, h * rowSize),
            0
        );

        // потом от 0 до currentIndex
        if (this._currentIndex > 0) {
            result.data.set(
                fullData.data.subarray(0, this._currentIndex * rowSize),
                topRows * rowSize
            );
        }

        return result;
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


    draw(ctx, width, height) {
        // ctx.save();

        // // переворачиваем по вертикали
        // ctx.translate(0, height);
        // ctx.scale(1, -1);

        // const w = this.width;
        // const h = this.maxRows;
        // const topRows = h - this._currentIndex;

        // // рисуем нижнюю часть (от currentIndex до конца)
        // ctx.drawImage(
        //     this._off,
        //     0, this._currentIndex, w, topRows,
        //     0, 0, width, (topRows / h) * height
        // );

        // // рисуем верхнюю часть (от 0 до currentIndex)
        // if (this._currentIndex > 0) {
        //     ctx.drawImage(
        //         this._off,
        //         0, 0, w, this._currentIndex,
        //         0, (topRows / h) * height, width, (this._currentIndex / h) * height
        //     );
        // }

        // ctx.restore();

        const w = this.width;
        const h = this.maxRows;
        const topRows = h - this._currentIndex;

        // рисуем сначала нижнюю часть (от currentIndex до конца)
        ctx.drawImage(
            this._off,
            0, this._currentIndex, w, topRows,
            0, 0, width, (topRows / h) * height
        );

        // рисуем верхнюю часть (от 0 до currentIndex)
        if (this._currentIndex > 0) {
            ctx.drawImage(
                this._off,
                0, 0, w, this._currentIndex,
                0, (topRows / h) * height, width, (this._currentIndex / h) * height
            );
        }
    }

}