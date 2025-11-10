/**
 * Ruler component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.Ruler = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Ruler']);
        this.AddClass('colibri-ui-ruler');

        this._canvas = this._element.querySelector('canvas');
        this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });

        this._min = 0;
        this._max = 100;
        this._step = 1;
        this._largeStep = 10;
        this._orientation = 'horizontal';
        this._align = 'end';

        this.handleResize = true;
        this.AddHandler('Resize', this.ResizeCanvas, false, this);

        this.ResizeCanvas();
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When selection is changed');
    }

    ResizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this._canvas.getBoundingClientRect();
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this._ctx.scale(dpr, dpr);
        this._render();
        if(this._hasSelector) {
            this._pane.bottom = this._align === 'end' ? 0 : null;
            this._pane.top = this._align === 'start' ? 0 : null;
        }
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
        this.ResizeCanvas();
    }

    /**
     * Maximum value
     * @type {Number}
     */
    get max() {
        return this._max;
    }
    /**
     * Maximum value
     * @type {Number}
     */
    set max(value) {
        value = this._convertProperty('Number', value);
        this._max = value;
        this.ResizeCanvas();
    }

    /**
     * Step of ruller
     * @type {Number}
     */
    get step() {
        return this._step;
    }
    /**
     * Step of ruller
     * @type {Number}
     */
    set step(value) {
        value = this._convertProperty('Number', value);
        this._step = value;
        this.ResizeCanvas();
    }

    /**
     * Large ruller step
     * @type {Number}
     */
    get largeStep() {
        return this._largeStep;
    }
    /**
     * Large ruller step
     * @type {Number}
     */
    set largeStep(value) {
        value = this._convertProperty('Number', value);
        this._largeStep = value;
        this.ResizeCanvas();
    }

    /**
     * Orientation of ruler
     * @type {horizontal,vertical}
     */
    get orientation() {
        return this._orientation;
    }
    /**
     * Orientation of ruler
     * @type {horizontal,vertical}
     */
    set orientation(value) {
        this._orientation = value;
        this.ResizeCanvas();
    }

    /**
     * Align of ruller, start of bounds or end of bounds
     * @type {start,end}
     */
    get align() {
        return this._align;
    }
    /**
     * Align of ruller, start of bounds or end of bounds
     * @type {start,end}
     */
    set align(value) {
        this._align = value;
        this.ResizeCanvas();
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
        this.ResizeCanvas();
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
        this.ResizeCanvas();
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
        this.ResizeCanvas();
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
        this.ResizeCanvas();
    }

    /**
     * Color of ruler lines
     * @type {String}
     */
    get rulerColor() {
        return this._rulerColor;
    }
    /**
     * Color of ruler lines
     * @type {String}
     */
    set rulerColor(value) {
        this._rulerColor = value;
        this.ResizeCanvas();
    }

    /**
     * Has the selector picker
     * @type {Boolean}
     */
    get hasSelector() {
        return this._hasSelector;
    }
    /**
     * Has the selector picker
     * @type {Boolean}
     */
    set hasSelector(value) {
        if(this._orientation === 'vertical') {
            throw new Error('Ruler selector is only available for horizontal rulers');
        }
        
        value = this._convertProperty('Boolean', value);
        this._hasSelector = value;
        this._showHasSelector();
    }
    _showHasSelector() {

        this._pane = new Colibri.UI.Pane('pane', this);
        this._pane.AddClass('colibri-ui-rangepicker-rangepicker-progress-pane');

        this._progress = new Colibri.UI.Pane('progress', this._pane);
        this._span1 = new Colibri.UI.Pane('span1', this._progress);
        this._span2 = new Colibri.UI.Pane('span2', this._progress);

        this._pane.shown = this._progress.shown = this._span1.shown = this._span2.shown = true;

        this._drag0 = new Colibri.UI.Drag(this._progress.container, this._pane.container, (newLeft, newTop) => this._progressMoved(newLeft, newTop));
        this._drag1 = new Colibri.UI.Drag(this._span1.container, this._pane.container, (newLeft, newTop) => this._span1Moved(newLeft, newTop));
        this._drag2 = new Colibri.UI.Drag(this._span2.container, this._pane.container, (newLeft, newTop) => this._span2Moved(newLeft, newTop));

    }

    _progressMoved(newLeft, newTop) {
        this._calculateValue(newLeft, null, true);
        this._showValue();
        this.Dispatch('Changed', {value: this.value});
    }

    _span1Moved(newLeft, newTop) {
        this._calculateValue(newLeft, null);
        this._showValue();
        this.Dispatch('Changed', {value: this.value});
    }

    _span2Moved(newLeft, newTop) {
        this._calculateValue(null, newLeft);
        this._showValue();
        this.Dispatch('Changed', {value: this.value});
    }

    _calculateValue(left, right, saveWidth = false) {
        if(left !== null) {
            this._setLeftPoint(left, saveWidth);
        }
        else if(right !== null) {
            this._setRightPoint(right, saveWidth);
        }
    }

    _setLeftPoint(left, saveWidth = false) {
        const width = this._pane.width;
        const perc = (left) * 100 / width;
        const max = this._max;
        const min = this._min;

        let newValue = min + ((max - min) * perc / 100);
        // newValue = Math.ceil(newValue / step) * step - step;
        if(newValue >= max) {
            newValue = max;
        }
        if(newValue <= min) {
            newValue = min;
        }
        if(saveWidth) {
            this._value[1] = newValue + (this._value?.[1] - this._value?.[0]);
        }
        this.value = [newValue, this._value?.[1]];

    }

    _setRightPoint(left, saveWidth = false) {
        const width = this._pane.width;
        const perc = (left + 8) * 100 / width;
        const max = this._max;
        const min = this._min;
        const step = this._step;

        let newValue = min + ((max - min) * perc / 100);
        // newValue = Math.ceil(newValue / step) * step + step;
        if(newValue >= max) {
            newValue = max;
        }
        if(newValue <= min) {
            newValue = min;
        }

        if(saveWidth) {
            this._value[0] = newValue - (this._value?.[1] - this._value?.[0]);
        }

        this.value = [this._value?.[0], newValue];

    }

    /**
     * Value of ruler selector
     * @type {Array}
     */
    get value() {
        return this._value;
    }
    /**
     * Value of ruler selector
     * @type {Array}
     */
    set value(value) {

        if(!this._hasSelector) {
            return;
        }

        value = this._convertProperty('Array', value);
        
        let left1 = parseFloat(value[0]);
        let left2 = parseFloat(value[1]);

        // left1 = Math.ceil(left1 / step) * step;
        if(left1 >= this._max) {
            left1 = this._max;
        }
        if(left1 <= this._min) {
            left1 = this._min;
        }

        if(left2 >= this._max) {
            left2 = this._max;
        }
        if(left2 <= this._min) {
            left2 = this._min;
        }

        this._value = [left1, left2];
        this._showValue();
    }
    _showValue() {
        
        let value = this._value;

        const width = parseFloat(this._pane.width) ?? 0;
        if(isNaN(width)) {
            return;
        }

        const max = parseFloat(this._max);
        const min = parseFloat(this._min);

        // max - min = 100
        // value - min = x
        // x = (min + value) * 100 / (max - min)
        let perc1 = (parseFloat(value[0]) - min) * 100 / (max - min);
        let perc2 = (parseFloat(value[1]) - min) * 100 / (max - min);

        if(perc1 < 0) {
            perc1 = 0;
        }

        if(perc2 < 0) {
            perc2 = 0;
        }


        // width = 100
        // left = perc
        const perc = width * perc1 / 100;
        const percWidth = width * perc2 / 100;
        let realWidth = (percWidth - perc);
        if(realWidth > width) {
            realWidth = width;
        }
        
        this._progress.container.css('width', realWidth.toFixed(4) + 'px');
        this._progress.container.css('left', perc.toFixed(4) + 'px');

    }

    _render() {

        const canvas = this._canvas;
        const ctx = this._ctx;
        const width = canvas.offsetWidth - 1;
        const height = canvas.offsetHeight - 1;
        if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
            return;
        }
        const maxHeight = (height - 10) * 2 / 3;
        const maxWidth = width; // (width - 10) * 2 / 3;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = this._rulerColor || '#000';
        ctx.fillStyle = this._labelColor || '#000';
        ctx.lineWidth = 1;

        ctx.font = this._labelFontAndSize || '10px monospace';
        ctx.textBaseline = this._align === 'start' ? 'top' : 'bottom';

        const range = this.max - this.min;
        if (!(range > 0)) return;

        const pxPerUnit = (this._orientation === 'vertical') ? height / range : width / range;
        const stepsCount = Math.floor(range / this.step);

        const labels = [];
        for (let i = 0; i <= stepsCount; i++) {
            const value = this.min + i * this.step;
            const isLarge = (i % this.largeStep) === 0;
            if (isLarge) {
                labels.push(ctx.measureText((this._labelFormatter || ((c, v) => v))(this, value)));
            }
        }

        const maxLabelWidth = Math.max(...labels.map(l => l.width)) + 2;

        for (let i = 0; i <= stepsCount; i++) {
            const value = this.min + i * this.step;
            const isLarge = (i % this.largeStep) === 0;

            if (this._orientation === 'vertical') {
                const y = Math.round(height - (value - this.min) * pxPerUnit);
                const lineLength = isLarge ? maxWidth - maxLabelWidth : (maxWidth - maxLabelWidth) / 3;

                ctx.beginPath();
                if (this._align === 'start') {
                    ctx.moveTo(0.5, y - 0.5);
                    ctx.lineTo(lineLength + 0.5, y - 0.5);
                } else {
                    ctx.moveTo(width - lineLength - 0.5, y - 0.5);
                    ctx.lineTo(width - 0.5, y - 0.5);
                }
                ctx.stroke();

                if (isLarge) {

                    const label = (this._labelFormatter || ((c, v) => v))(this, value);
                    if (i === 0) ctx.textBaseline = 'bottom';
                    else if (i === stepsCount) ctx.textBaseline = 'top';
                    else ctx.textBaseline = 'middle';

                    if (this._align === 'start') {
                        ctx.textAlign = 'left';
                        ctx.fillText(label, lineLength + 2, y - 2);
                    } else if (this._align === 'end') {
                        ctx.textAlign = 'right';
                        ctx.fillText(label, width - lineLength - 2, y + 2);
                    }
                }

            } else {
                const x = Math.round((value - this.min) * pxPerUnit);
                const lineLength = isLarge ? maxHeight : maxHeight / 3;

                ctx.beginPath();
                if (this._align === 'start') {
                    ctx.moveTo(x + 0.5, 0.5);
                    ctx.lineTo(x + 0.5, lineLength + 0.5);
                } else {
                    ctx.moveTo(x + 0.5, height - lineLength - 0.5);
                    ctx.lineTo(x + 0.5, height - 0.5);
                }
                ctx.stroke();

                if (isLarge) {
                    const label = (this._labelFormatter || ((c, v) => v))(this, value);
                    if (i === 0) ctx.textAlign = 'left';
                    else if (i === stepsCount) ctx.textAlign = 'right';
                    else ctx.textAlign = this._labelAlign || 'center';

                    if (this._align === 'start') {
                        ctx.textBaseline = 'top';
                        ctx.fillText(label, x, maxHeight + 4);
                    } else {
                        ctx.textBaseline = 'bottom';
                        ctx.fillText(label, x, height - maxHeight - 4);
                    }
                }
            }
        }

    }

}