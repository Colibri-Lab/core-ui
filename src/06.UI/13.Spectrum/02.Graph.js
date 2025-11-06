/**
 * Spectrum graph
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Spectrum
 */
Colibri.UI.Spectrum.Graph = class extends Colibri.UI.FlexBox {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container, element) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Spectrum.Graph']);
        this.AddClass('colibri-ui-spectrum-graph');

        this.GenerateChildren(element, this);
        this._canvas = Element.create('canvas').appendTo(this._element);
        this._ctx = this._canvas.getContext('2d');
        this._palette = this._createPalette();

        this.handleResize = true;
        this.AddHandler('Resize', this.ResizeCanvas, false, this);

    }

    ResizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this._canvas.getBoundingClientRect();
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this._ctx.scale(dpr, dpr);
    }

    _createPalette() {
        const palette = new Array(256);
        for (let i = 0; i < 256; i++) {
            const hue = 240 - (i * 240 / 255); // blue → red
            palette[i] = `hsl(${hue},100%,50%)`;
        }
        return palette;
    }

    /**
     * Maximum ot values
     * @type {Number}
     */
    get max() {
        return this._max;
    }
    /**
     * Maximum ot values
     * @type {Number}
     */
    set max(value) {
        value = this._convertProperty('Number', value);
        this._max = value;
    }
    
    /**
     * Minimum ot values
     * @type {Number}
     */
    get min() {
        return this._min;
    }
    /**
     * Minimum ot values
     * @type {Number}
     */
    set min(value) {
        value = this._convertProperty('Number', value);
        this._min = value;
    }

    Draw(floatArray) {
        try {
            const bounds = this._canvas.bounds();
            const ctx = this._ctx;
            ctx.clearRect(0, 0, bounds.outerWidth, bounds.outerHeight);

            const len = floatArray.length;
            if (len === 0) return;

            const step = bounds.outerWidth / len;
            const palette = this._palette;

            // находим минимальное и максимальное значение
            let min = Infinity, max = -Infinity;
            if(this._max && this._min) {
                max = this._max;
                min = this._min;
            } else {
                // находим минимальное и максимальное значение
                for (let i = 0; i < len; i++) {
                    const v = floatArray[i];
                    if (!isNaN(v)) {
                        if (v < min) min = v;
                        if (v > max) max = v;
                    }
                }
                if (min === max) max = min + 1; // защита от деления на ноль
            }

            // создаём горизонтальный градиент
            const grad = ctx.createLinearGradient(0, 0, bounds.outerWidth, 0);
            for (let i = 0; i < len; i++) {
                let value = floatArray[i];
                if (isNaN(value)) value = min;
                const normValue = (value - min) / (max - min); // нормализуем 0..1
                const colorIndex = Math.floor(normValue * (palette.length - 1));
                grad.addColorStop(i / (len - 1), palette[colorIndex]);
            }

            // строим path линии
            ctx.beginPath();
            for (let i = 0; i < len; i++) {
                let value = floatArray[i];
                if (isNaN(value)) value = min;
                const norm = (value - min) / (max - min); // 0..1
                const y = bounds.outerHeight - norm * bounds.outerHeight; // масштабируем по высоте
                const x = i * step;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            // замыкаем path вниз
            ctx.lineTo(bounds.outerWidth, bounds.outerHeight);
            ctx.lineTo(0, bounds.outerHeight);
            ctx.closePath();

            ctx.fillStyle = grad;
            ctx.fill();

            // рисуем белую линию поверх
            // ctx.beginPath();
            // for (let i = 0; i < len; i++) {
            //     let value = floatArray[i];
            //     if (isNaN(value)) value = min;
            //     const norm = (value - min) / (max - min);
            //     const y = bounds.outerHeight - norm * bounds.outerHeight;
            //     const x = i * step;
            //     if (i === 0) ctx.moveTo(x, y);
            //     else ctx.lineTo(x, y);
            // }
            // ctx.strokeStyle = '#c0c0c0';
            // ctx.lineWidth = 1;
            // ctx.stroke();

        } catch (e) {
            console.error(e);
        }
    }


    // Draw(floatArray) {
    //     try {
    //         const bounds = this._canvas.bounds();
    //         const ctx = this._ctx;
    //         ctx.clearRect(0, 0, bounds.outerWidth, bounds.outerHeight);

    //         const len = floatArray.length;
    //         const step = bounds.outerWidth / len;

    //         ctx.beginPath();
    //         for (let i = 0; i < len; i++) {
    //             let value = floatArray[i];
    //             if (isNaN(value)) value = -100;
    //             const y = bounds.outerHeight - ((value + 100) / 100) * bounds.outerHeight;
    //             const x = i * step;
    //             if (i === 0) ctx.moveTo(x, y);
    //             else ctx.lineTo(x, y);
    //         }

    //         ctx.strokeStyle = '#000000';
    //         ctx.lineWidth = 1;
    //         ctx.stroke();

    //         ctx.closePath(); // <-- важно для завершения пути, но не заливает
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

}