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
        this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });

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

        if (this._colorPalatte) {
            const f = this._colorPalatte;
            return f(this);
        } else {
            const palette = new Array(256);
            for (let i = 0; i < 256; i++) {
                const hue = 240 - (i * 240 / 255); // blue → red
                palette[i] = `hsl(${hue},100%,50%)`;
            }
            return palette;
        }

    }

    /**
     * Color palatte function
     * @type {Function}
     */
    get colorPalette() {
        return this._colorPalatte;
    }
    /**
     * Color palatte function
     * @type {Function}
     */
    set colorPalette(value) {
        value = this._convertProperty('Function', value);
        this._colorPalatte = value;
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

    /**
     * Label color string
     * @type {String}
     */
    get labelColor() {
        return this._labelColor;
    }
    /**
     * Label color string
     * @type {String}
     */
    set labelColor(value) {
        this._labelColor = value;
    }

    /**
     * Labels font and size, i.e. 10px monospace
     * @type {String}
     */
    get labelFontAndSize() {
        return this._labelFontAndSize;
    }
    /**
     * Labels font and size, i.e. 10px monospace
     * @type {String}
     */
    set labelFontAndSize(value) {
        this._labelFontAndSize = value;
    }

    /**
     * Label align
     * @type {center,left,right}
     */
    get labelAlign() {
        return this._labelAlign;
    }
    /**
     * Label align
     * @type {center,left,right}
     */
    set labelAlign(value) {
        this._labelAlign = value;
    }

    /**
     * Label formatter function, i.e. (label, axis) => {}
     * @type {Function}
     */
    get labelFormatter() {
        return this._labelFormatter;
    }
    /**
     * Label formatter function, i.e. (label, axis) => {}
     * @type {Function}
     */
    set labelFormatter(value) {
        value = this._convertProperty('Function', value);
        this._labelFormatter = value;
    }

    /**
     * Axis color
     * @type {String}
     */
    get axisColor() {
        return this._axisColor;
    }
    /**
     * Axis color
     * @type {String}
     */
    set axisColor(value) {
        this._axisColor = value;
    }

    /**
     * Color of zero line
     * @type {String}
     */
    get zeroLineColor() {
        return this._zeroLineColor;
    }
    /**
     * Color of zero line
     * @type {String}
     */
    set zeroLineColor(value) {
        this._zeroLineColor = value;
    }

    /**
     * Zero line stroke width
     * @type {Number}
     */
    get zeroLineStroke() {
        return this._zeroLineStroke;
    }
    /**
     * Zero line stroke width
     * @type {Number}
     */
    set zeroLineStroke(value) {
        value = this._convertProperty('Number', value);
        this._zeroLineStroke = value;
    }

    /**
     * Stroke width
     * @type {Number}
     */
    get axisStroke() {
        return this._axisStroke;
    }
    /**
     * Stroke width
     * @type {Number}
     */
    set axisStroke(value) {
        value = this._convertProperty('Number', value);
        this._axisStroke = value;
    }

    /**
     * Padding from label to axis
     * @type {Number}
     */
    get labelPadding() {
        return this._labelPadding;
    }
    /**
     * Padding from label to axis
     * @type {Number}
     */
    set labelPadding(value) {
        value = this._convertProperty('Number', value);
        this._labelPadding = value;
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
        this._start = value;
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
        this._end = value;
    }

    /**
     * Show maximums
     * @type {Boolean}
     */
    get showMaximums() {
        return this._showMaximums;
    }
    /**
     * Show maximums
     * @type {Boolean}
     */
    set showMaximums(value) {
        value = this._convertProperty('Boolean', value);
        this._showMaximums = value;
    }

    _getColor(palette, index, alpha = 1) {
        let color = null;
        if (index >= palette.length) {
            color = palette[palette.length - 1];
        } else if (index < 0) {
            color = palette[0];
        } else {
            color = palette[index];
        }
        if (color && alpha < 1) {
            return color.replace('hsl', 'hsla').replace(')', `,${alpha})`);
        }
        return !!color ? color : '#ffffff';
    }

    /**
     * Maximum lines color
     * @type {String}
     */
    get maxLineColor() {
        return this._maxLineColor;
    }
    /**
     * Maximum lines color
     * @type {String}
     */
    set maxLineColor(value) {
        this._maxLineColor = value;
    }

    /**
     * Maximum line stroke
     * @type {Number}
     */
    get maxLineStroke() {
        return this._maxLineStroke;
    }
    /**
     * Maximum line stroke
     * @type {Number}
     */
    set maxLineStroke(value) {
        value = this._convertProperty('Number', value);
        this._maxLineStroke = value;
    }

    /**
     * Count of labels on X axis
     * @type {Number}
     */
    get xLabels() {
        return this._xLabels;
    }
    /**
     * Count of labels on X axis
     * @type {Number}
     */
    set xLabels(value) {
        value = this._convertProperty('Number', value);
        this._xLabels = value;
    }

    /**
     * Count of labels on Y axis
     * @type {Number}
     */
    get yLabels() {
        return this._yLabels;
    }
    /**
     * Count of labels on Y axis
     * @type {Number}
     */
    set yLabels(value) {
        value = this._convertProperty('Number', value);
        this._yLabels = value;
    }

    _crop(floatArray) {
        const start = this._start || 0;
        const end = this._end != null ? this._end : floatArray.length;
        console.log(this._start, this._end);
        return floatArray.subarray(start, end); // возвращает Float32Array без копирования данных
    }


    Draw(floatArray) {
        try {

            floatArray = this._crop(floatArray);

            const palette = this._createPalette();
            const bounds = this._canvas.bounds();
            const ctx = this._ctx;
            ctx.clearRect(0, 0, bounds.outerWidth, bounds.outerHeight);

            const len = floatArray.length;
            if (len === 0) return;

            const step = bounds.outerWidth / len;

            // находим минимальное и максимальное значение
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

                if (this._showMaximums) {
                    if (!this._maxValues || this._maxValues.length != floatArray.length) {
                        this._maxValues = new Float32Array(len);
                        for (let i = 0; i < len; i++) this._maxValues[i] = floatArray[i];
                    }
                    for (let i = 0; i < len; i++) {
                        const v = this._maxValues[i];
                        if (!isNaN(v)) {
                            if (v < min) min = v;
                            if (v > max) max = v;
                        }
                    }
                }

                if (min === max) max = min + 1; // защита от деления на ноль
                max = max + max * 10 / 100;
            }

            // создаём горизонтальный градиент
            const grad = ctx.createLinearGradient(0, 0, bounds.outerWidth, 0);
            for (let i = 0; i < len; i++) {
                let value = floatArray[i];
                if (isNaN(value)) value = min;
                const normValue = (value - min) / (max - min);
                const colorIndex = Math.floor(normValue * (palette.length - 1));
                grad.addColorStop(i / (len - 1), this._getColor(palette, colorIndex));
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

            if (min < 0 && max > 0) {
                const zeroY = bounds.outerHeight - ((0 - min) / (max - min)) * bounds.outerHeight;
                ctx.beginPath();
                ctx.moveTo(0, zeroY);
                ctx.lineTo(bounds.outerWidth, zeroY);
                ctx.strokeStyle = this._zeroLineColor || '#888'; // полупрозрачная белая линия
                ctx.lineWidth = this._zeroLineStroke || 1;
                ctx.stroke();
            }

            // --- Оси и подписи ---
            // ось X
            ctx.strokeStyle = this._axisColor || '#888';
            ctx.lineWidth = this._axisStroke || 1;
            ctx.beginPath();
            ctx.moveTo(0, bounds.outerHeight);
            ctx.lineTo(bounds.outerWidth, bounds.outerHeight);
            // ось Y
            ctx.moveTo(0, 0);
            ctx.lineTo(0, bounds.outerHeight);
            ctx.stroke();

            this._drawMaxLine(ctx, bounds, floatArray, len, step, min, max);

            this._drawAxises(ctx, bounds, min, max);

            // линия нуля, если она в диапазоне
            if (min < 0 && max > 0) {
                const zeroY = bounds.outerHeight - ((0 - min) / (max - min)) * bounds.outerHeight;
                ctx.beginPath();
                ctx.moveTo(0, zeroY);
                ctx.lineTo(bounds.outerWidth, zeroY);
                ctx.strokeStyle = this._zeroLineColor || '#888';
                ctx.lineWidth = this._zeroLineStroke || 1;
                ctx.stroke();
            }

        } catch (e) {
            console.error(e);
        }
    }

    _drawMaxLine(ctx, bounds, floatArray, len, step, min, max) {
        if (this._showMaximums) {

            if (!this._maxValues || this._maxValues.length !== len) {
                this._maxValues = new Float32Array(len);
                for (let i = 0; i < len; i++) this._maxValues[i] = floatArray[i];
            }

            // --- обновляем максимальные значения ---
            for (let i = 0; i < len; i++) {
                if (floatArray[i] > this._maxValues[i]) {
                    this._maxValues[i] = floatArray[i];
                }
            }

            if (this._maxLineColor === 'grad') {

                const grad = ctx.createLinearGradient(0, 0, bounds.outerWidth, 0);
                const palette = this._createPalette();
                for (let i = 0; i < len; i++) {
                    const normValue = (this._maxValues[i] - min) / (max - min);
                    const colorIndex = Math.floor(normValue * (palette.length - 1));
                    grad.addColorStop(i / (len - 1), this._getColor(palette, colorIndex, 0.4));
                }
                ctx.strokeStyle = grad;
            } else {
                ctx.strokeStyle = this._maxLineColor || 'rgba(255,0,0,0.6)';
            }

            ctx.beginPath();
            for (let i = 0; i < len; i++) {
                const norm = (this._maxValues[i] - min) / (max - min);
                const y = bounds.outerHeight - norm * bounds.outerHeight;
                const x = i * step;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.lineWidth = this._maxLineStroke || 1;
            ctx.stroke();
        }
    }

    _drawAxises(ctx, bounds, min, max) {
        ctx.fillStyle = this._labelColor || '#888';
        ctx.font = this._labelFontAndSize || '10px monospace';
        ctx.textAlign = this._labelAlign || 'center';

        const xLabels = this._xLabels || 10;
        for (let i = 0; i <= xLabels; i++) {
            const x = (this._start || 0) + (bounds.outerWidth / xLabels) * i;
            let freq = x; //(i / xLabels);
            if (this._labelFormatter) {
                const f = this._labelFormatter;
                freq = f(this, freq, 'x', this._start, this._end);
            }
            ctx.fillText(freq, x + (this._labelPadding || 2), bounds.outerHeight - (this._labelPadding || 2));

            ctx.beginPath();
            ctx.moveTo(x, bounds.outerHeight);
            ctx.lineTo(x, bounds.outerHeight - 5);
            ctx.stroke();
        }

        const yLabels = this._yLabels || 5;
        ctx.textAlign = 'left';
        for (let j = 0; j <= yLabels; j++) {
            const value = min + ((max - min) / yLabels) * j; // равномерные шаги между min и max
            const y = bounds.outerHeight - ((value - min) / (max - min)) * bounds.outerHeight;
            let label = value.toFixed(0);
            if (this._labelFormatter) label = this._labelFormatter(this, value, 'y', min, max);
            ctx.fillText(label, this._labelPadding || 2, y + 12 + (this._labelPadding || 2));

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(5, y);
            ctx.stroke();
        }
    }

    Clear() {
        const bounds = this._canvas.bounds();
        this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });
        this._ctx.clearRect(0, 0, bounds.outerWidth, bounds.outerHeight);
        this.ResetMaximums();
    }

    ResetMaximums() {
        this._maxValues = null;
    }


}