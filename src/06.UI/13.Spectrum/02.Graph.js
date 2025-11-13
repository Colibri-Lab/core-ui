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
        this._selections = new Colibri.UI.Spectrum.Selections('selections', this);
        this._selections.shown = true;

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
     * Zero line value
     * @type {Number}
     */
    get zeroLineValue() {
        return this._zeroLineValue;
    }
    /**
     * Zero line value
     * @type {Number}
     */
    set zeroLineValue(value) {
        this._zeroLineValue = value;
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
     * ToolTip function
     * @type {Function}
     */
    get toolTipFunction() {
        return this._toolTipFunction;
    }
    /**
     * ToolTip function
     * @type {Function}
     */
    set toolTipFunction(value) {
        this._toolTipFunction = value;
        this.toolTipPoint = 'mouse';
        this.AddHandler('MouseMove', this.__thisMouseMove);
    }

    __thisMouseMove(event, args) {
        const bounds = this._element.bounds();
        const point = {left: args.domEvent.screenX - bounds.left, top: args.domEvent.screenY - bounds.top};
        if(this._toolTipFunction) {
            this.toolTip = this._toolTipFunction(this, point);
        }
    }

    Resize(start, end) {
        this._start = start;
        this._end = end;
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
        return floatArray.subarray(start, end); // возвращает Float32Array без копирования данных
    }

    /**
     * Color of grid lines (color will set opacity .5)
     * @type {String}
     */
    get hgridLinesColor() {
        return this._hgridLinesColor;
    }
    /**
     * Color of grid lines (color will set opacity .5)
     * @type {String}
     */
    set hgridLinesColor(value) {
        this._hgridLinesColor = value;
    }

    /**
     * Stroke of grid lines
     * @type {Number}
     */
    get hgridLinesStroke() {
        return this._hgridLinesStroke;
    }
    /**
     * Stroke of grid lines
     * @type {Number}
     */
    set hgridLinesStroke(value) {
        value = this._convertProperty('Number', value);
        this._hgridLinesStroke = value;
    }

    /**
     * Grid lines step
     * @type {Number}
     */
    get hgridLinesStep() {
        return this._hgridLinesStep;
    }
    /**
     * Grid lines step
     * @type {Number}
     */
    set hgridLinesStep(value) {
        value = this._convertProperty('Number', value);
        this._hgridLinesStep = value;
    }

    /**
     * Grid line large steps
     * @type {Number}
     */
    get hgridLinesLargeStep() {
        return this._hgridLinesLargeStep;
    }
    /**
     * Grid line large steps
     * @type {Number}
     */
    set hgridLinesLargeStep(value) {
        value = this._convertProperty('Number', value);
        this._gridLinesLargeStep = value;
    }


    /**
     * Color of grid lines (color will set opacity .5)
     * @type {String}
     */
    get vgridLinesColor() {
        return this._vgridLinesColor;
    }
    /**
     * Color of grid lines (color will set opacity .5)
     * @type {String}
     */
    set vgridLinesColor(value) {
        this._vgridLinesColor = value;
    }

    /**
     * Stroke of grid lines
     * @type {Number}
     */
    get vgridLinesStroke() {
        return this._vgridLinesStroke;
    }
    /**
     * Stroke of grid lines
     * @type {Number}
     */
    set vgridLinesStroke(value) {
        value = this._convertProperty('Number', value);
        this._vgridLinesStroke = value;
    }

    /**
     * Grid lines step
     * @type {Number}
     */
    get vgridLinesStep() {
        return this._vgridLinesStep;
    }
    /**
     * Grid lines step
     * @type {Number}
     */
    set vgridLinesStep(value) {
        value = this._convertProperty('Number', value);
        this._vgridLinesStep = value;
    }

    /**
     * Grid line large steps
     * @type {Number}
     */
    get vgridLinesLargeStep() {
        return this._vgridLinesLargeStep;
    }
    /**
     * Grid line large steps
     * @type {Number}
     */
    set vgridLinesLargeStep(value) {
        value = this._convertProperty('Number', value);
        this._vgridLinesLargeStep = value;
    }
    
    /**
     * Maximum line color method
     * @type {Function}
     */
    get maxLineColor() {
        return this._maxLineColor;
    }
    /**
     * Maximum line color method
     * @type {Function}
     */
    set maxLineColor(value) {
        value = this._convertProperty('Function', value);
        this._maxLineColor = value;
    }

    /**
     * Graph color method
     * @type {Function}
     */
    get graphColor() {
        return this._graphColor;
    }
    /**
     * Graph color method
     * @type {Function}
     */
    set graphColor(value) {
        value = this._convertProperty('Function', value);
        this._graphColor = value;
    }

    /**
     * Type of graph
     * @type {line,graph}
     */
    get graphType() {
        return this._graphType;
    }
    /**
     * Type of graph
     * @type {line,graph}
     */
    set graphType(value) {
        this._graphType = value;
    }

    Draw(floatArray) {
        try {

            // save data for future use
            this._floatArray = floatArray;
            
            if(!this._maxValues) {
                this._maxValues = new Float32Array(this._floatArray.length);
                for (let i = 0; i < this._floatArray.length; i++) this._maxValues[i] = this._floatArray[i];
            }
            for (let i = 0; i < this._floatArray.length; i++) {
                if (this._floatArray[i] > this._maxValues[i]) {
                    this._maxValues[i] = this._floatArray[i];
                }
            }

            floatArray = this._crop(floatArray);
            const maxValues = this._crop(this._maxValues);

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
                    for (let i = 0; i < len; i++) {
                        const v = maxValues[i];
                        if (!isNaN(v)) {
                            if (v < min) min = v;
                            if (v > max) max = v;
                        }
                    }
                }

                if (min === max) max = min + 1; // защита от деления на ноль
            }

            this._drawGridLines(ctx, bounds, min, max, floatArray);

            this._drawZeroLine(ctx, bounds, min, max);

            if(this._graphType === 'graph') {
                this._drawGraph(ctx, floatArray, min, max);
            } else if(this._graphType === 'line') {
                this._drawLine(ctx, floatArray, min, max);
            }

            this._drawMaxLine(ctx, bounds, maxValues, len, step, min, max);

            this._drawAxises(ctx, bounds, min, max);



        } catch (e) {
            console.error(e);
        }
    }

    _drawLine(ctx, floatArray, min, max) {
        const bounds = this._canvas.bounds();
        const palette = this._createPalette();
        const len = floatArray.length;
        const step = bounds.outerWidth / len;

        if (len === 0) return;

        ctx.beginPath();
        for (let i = 0; i < len; i++) {
            let value = floatArray[i];
            if (isNaN(value)) value = min;
            const norm = (value - min) / (max - min);
            const y = bounds.outerHeight - norm * bounds.outerHeight;
            const x = i * step;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = (this._graphColor ?? (() => 'rgba(0,0,0,0.4)'))(this, ctx, palette, bounds.outerWidth, len, floatArray, min, max);
        ctx.lineWidth = this._lineWidth || 1;
        ctx.stroke();

        // --- оси ---
        ctx.strokeStyle = this._axisColor || '#888';
        ctx.lineWidth = this._axisStroke || 1;
        ctx.beginPath();
        ctx.moveTo(0, bounds.outerHeight);
        ctx.lineTo(bounds.outerWidth, bounds.outerHeight);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, bounds.outerHeight);
        ctx.stroke();
    }



    _drawGraph(ctx, floatArray, min, max) {
        const bounds = this._canvas.bounds();
        const palette = this._createPalette();
        const len = floatArray.length;
        const step = bounds.outerWidth / len;

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

        ctx.fillStyle = (this._graphColor ?? (() => 'rgba(0,0,0,0.4)'))(this, ctx, palette, bounds.outerWidth, len, floatArray, min, max);
        ctx.fill();

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
    }

    _drawGridLines(ctx, bounds, min, max, floatArray) {

        if (this._hgridLinesColor && this._hgridLinesStep) {

            ctx.strokeStyle = this._hgridLinesColor;
            ctx.lineWidth = this._hgridLinesStroke || 1;

            const stepValue = this._hgridLinesStep;
            const largeStepValue = this._hgridLinesLargeStep || (stepValue * 5);

            for (let value = min; value <= max; value += stepValue) {
                const norm = (value - min) / (max - min);
                const y = bounds.outerHeight - norm * bounds.outerHeight;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(bounds.outerWidth, y);

                if (largeStepValue && (Math.abs(value % largeStepValue) < 0.0001 || Math.abs(value - min) < 0.0001 || Math.abs(value - max) < 0.0001)) {
                    ctx.lineWidth = (this._hgridLinesStroke || 1) * 2;
                } else {
                    ctx.lineWidth = this._hgridLinesStroke || 1;
                }

                ctx.stroke();
            }

        }


        if (this._vgridLinesColor && this._vgridLinesStep) {

            ctx.strokeStyle = this._vgridLinesColor;
            ctx.lineWidth = this._vgridLinesStroke || 1;

            const stepValue = this._vgridLinesStep;
            const largeStepValue = this._vgridLinesLargeStep || (stepValue * 5);

            for (let value = 0; value <= floatArray.length; value += stepValue) {
                const norm = value / floatArray.length;
                const x = bounds.outerWidth - norm * bounds.outerWidth;

                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, bounds.outerWidth);

                if (largeStepValue && (Math.abs(value % largeStepValue) < 0.0001 || Math.abs(value) < 0.0001 || Math.abs(value - floatArray.length) < 0.0001)) {
                    ctx.lineWidth = (this._vgridLinesStroke || 1) * 2;
                } else {
                    ctx.lineWidth = this._vgridLinesStroke || 1;
                }

                ctx.stroke();
            }

        }



    }

    _drawZeroLine(ctx, bounds, min, max) {
        if (min < (this._zeroLineValue ?? 0) && max > (this._zeroLineValue ?? 0)) {
            const zeroY = bounds.outerHeight - (((this._zeroLineValue ?? 0) - min) / (max - min)) * bounds.outerHeight;
            ctx.beginPath();
            ctx.moveTo(0, zeroY);
            ctx.lineTo(bounds.outerWidth, zeroY);
            ctx.strokeStyle = this._zeroLineColor || '#888';
            ctx.lineWidth = this._zeroLineStroke || 1;
            ctx.stroke();
        }
    }

    _drawMaxLine(ctx, bounds, floatArray, len, step, min, max) {
        if (this._showMaximums) {
            const palette = this._createPalette();

            ctx.strokeStyle = (this._maxLineColor ?? (() => 'rgba(255,0,0,0.8)'))(this, ctx, palette, bounds.outerWidth, len, floatArray, min, max);

            ctx.beginPath();
            for (let i = 0; i < len; i++) {
                const norm = (floatArray[i] - min) / (max - min);
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
        if (this._xLabels) {
            ctx.fillStyle = this._labelColor || '#888';
            ctx.font = this._labelFontAndSize || '10px monospace';
            ctx.textAlign = this._labelAlign || 'center';

            const xLabels = this._xLabels || 10;
            for (let i = 0; i <= xLabels; i++) {
                const x = (this._start || 0) + (bounds.outerWidth / xLabels) * i;
                ctx.beginPath();
                ctx.moveTo(x, bounds.outerHeight);
                ctx.lineTo(x, bounds.outerHeight - 5);
                ctx.stroke();
            }
        }

        if (this._yLabels) {
            const yLabels = this._yLabels || 5;
            ctx.textAlign = 'left';
            for (let j = 0; j <= yLabels; j++) {
                const value = min + ((max - min) / yLabels) * j;
                const y = bounds.outerHeight - ((value - min) / (max - min)) * bounds.outerHeight;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(5, y);
                ctx.stroke();
            }
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

    Resize(start, end) {
        this._start = start;
        this._end = end;

        this.Draw(this._floatArray);
    }

    /**
     * Selections object
     * @type {Colibri.UI.Spectrum.Selections}
     * @readonly
     */
    get Selections() {
        return this._selections;
    }


}