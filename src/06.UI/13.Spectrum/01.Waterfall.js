/**
 * Waterfall spectrum viewer
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Spectrum
 */
Colibri.UI.Spectrum.Waterfall = class extends Colibri.UI.FlexBox {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container, element) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Spectrum.Waterfall']);
        this.AddClass('colibri-ui-spectrum-waterfall');

        this.GenerateChildren(element, this);
        this._canvas = Element.create('canvas').appendTo(this._element);
        this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });

        this.handleResize = true;
        this.AddHandler('Resize', this.ResizeCanvas, false, this);

        this._palette = this._createPalette();
        this._row = 0;

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

    _getColor(palette, index) {
        if(index >= palette.length) {
            return palette[palette.length - 1];
        } else if(index < 0) {
            return palette[0];
        }
        return palette[index];
    }


    Draw(floatArray) {
        try {

            const ctx = this._ctx;
            const bounds = this._canvas.bounds();
            const w = bounds.outerWidth;
            const h = bounds.outerHeight;

            // scroll вниз на 1px
            const imageData = ctx.getImageData(0, 0, w, h);
            ctx.putImageData(imageData, 0, 1);

            const len = floatArray.length;
            const palette = this._palette;
            const step = w / len;
            if (len === 0) return;

            let min = Infinity, max = -Infinity;
            if (this._max !== undefined && this._min !== undefined) {
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

            // создаём горизонтальный градиент по линии
            const grad = ctx.createLinearGradient(0, 0, w, 0);
            for (let i = 0; i < len; i++) {
                let value = floatArray[i];
                if (isNaN(value)) value = min;

                const norm = (value - min) / (max - min); // 0..1
                const colorIndex = Math.floor(norm * (palette.length - 1));

                grad.addColorStop(i / (len - 1), this._getColor(palette, colorIndex));
            }

            // рисуем 1px прямоугольник сверху
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, 1);

        } catch (e) {
            console.error(e);
        }
    }


}