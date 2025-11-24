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

        this._selections = new Colibri.UI.Spectrum.Selections('selections', this);
        this._selections.shown = true;

        this._currentRow = 0;
        this._selectionMode = 'none';

        this.handleResize = true;
        this.AddHandler('Resize', this.ResizeCanvas, false, this);

        this._length = 1000;
        this._waterfallBuffer = new Colibri.UI.WaterfallBuffer(1, this._length);

        this._palette = this._createPalette();
        this._row = 0;
        this._history = new Colibri.Common.History(this._length);

        this.enablePointerControl = true;

        this.AddHandler('PointerControlStart', this.__thisPointerControlStart);
        this.AddHandler('PointerControlEnd', this.__thisPointerControlEnd);
        this.AddHandler('PointerControlMove', this.__thisPointerControlMove);

        this.AddHandler('Shown', this.__thisShown);
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('GrabStart', false, 'When waterfall is grabbed');
        this.RegisterEvent('Grabbing', false, 'When waterfall is grabbed');
        this.RegisterEvent('GrabEnd', false, 'When waterfall is grabbed');
    }


    /**
     * Selection mode
     * @type {none,select-column,select-row,select-rect}
     */
    get selectionMode() {
        return this._selectionMode;
    }
    /**
     * Selection mode
     * @type {none,select-column,select-row,select-rect}
     */
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
        if (this.selectionMode != 'none') {
            this._selection = this.Selections.Add(args.point, this._selectionMode, document.keysPressed.ctrl);
        } else {
            this.cursor = 'grab';
            this.Dispatch('GrabStart', args);
        }
    }

    __thisPointerControlEnd(event, args) {
        if (this.selectionMode != 'none') {
            if (args.rect.width === 0 || args.rect.height === 0) {
                this.Selections.Remove(this._selection);
            } else {
                this.Selections.Update(this._selection, args.rect);

            }
        } else {
            this.cursor = 'default';
            this.Dispatch('GrabEnd', args);
        }
    }

    __thisPointerControlMove(event, args) {
        if (this._selectionMode !== 'none') {
            this.Selections.Update(this._selection, args.rect);
        } else {
            this.cursor = 'grabbing';
            this.Dispatch('Grabbing', args);
        }
    }


    /**
     * Selections object
     * @type {Colibri.UI.Spectrum.Selections}
     * @readonly
     */
    get Selections() {
        return this._selections;
    }

    __thisShown(event, args) {
        // Colibri.Common.Delay(100).then(() => {
        //     const dpr = window.devicePixelRatio || 1;
        //     const rect = this._canvas.getBoundingClientRect();
        //     this._canvas.width = rect.width * dpr;
        //     this._canvas.height = rect.height * dpr;
        //     this._ctx.scale(dpr, dpr);
        //     this._waterfallBuffer.resize(rect.width * dpr, this._waterfallBuffer.maxRows);
        // })
    }

    ResizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this._canvas.getBoundingClientRect();
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this._ctx.scale(dpr, dpr);
        this._waterfallBuffer.resize(rect.width * dpr, this._waterfallBuffer.maxRows);
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
     * Start index of waterfall
     * @type {Number}
     */
    get startIndex() {
        return this._startIndex;
    }
    /**
     * Start index of waterfall
     * @type {Number}
     */
    set startIndex(value) {
        this._startIndex = value;
    }

    /**
     * End index of waterfall
     * @type {Number}
     */
    get endIndex() {
        return this._endIndex;
    }
    /**
     * End index of waterfall
     * @type {Number}
     */
    set endIndex(value) {
        this._endIndex = value;
    }

    ResizeVertical(start, end) {
        this.startIndex = start;
        this.endIndex = end;
        this.ShowBuffer();
    }

    Rearange(min, max) {
        this.min = min;
        this.max = max;
        this.Redraw();
    }

    Resize(start, end) {
        this._start = start;
        this._end = end;
        this.Redraw();
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


    _crop(floatArray) {
        const start = this._start || 0;
        const end = this._end != null ? this._end : floatArray.length;
        return floatArray.subarray(start, end);
    }

    set history(value) {
        this._history.clear();
        let i = 0;
        value = value.reverse();
        for (const item of value) {
            this.Draw(item, false);
        }

        this.ShowBuffer();

    }
    get history() {
        return this._history.getAll();
    }

    /**
     * Length of waterfall
     * @type {Number}
     */
    get length() {
        return this._length;
    }
    /**
     * Length of waterfall
     * @type {Number}
     */
    set length(value) {
        value = this._convertProperty('Number', value);
        this._length = value;
        this._history.resize(value);

        this._waterfallBuffer = new Colibri.UI.WaterfallBuffer(this._canvas.bounds().outerWidth || 1, this._length);

    }

    Redraw() {
        console.log(this._history);
        debugger;
        const items = this._history.getAll();
        this.Clear();
        let i = 0;
        for (const index in items) {
            if (index.isNumeric()) {
                this.Draw(items[index], false);
            }
        }
        
        this.ShowBuffer();
    }


    Draw(floatArray, show = true) {
        try {
            if (!floatArray) {
                return;
            }

            this._history.add(floatArray);
            // floatArray = this._crop(floatArray);
            if (floatArray.length == 0) {
                return;
            }


            // let min = Infinity, max = -Infinity;
            // if (this._max !== undefined && this._min !== undefined) {
            //     max = this._max;
            //     min = this._min;
            // } else {
            //     // находим минимальное и максимальное значение
            //     for (let i = 0; i < floatArray.length; i++) {
            //         const v = floatArray[i];
            //         if (!isNaN(v)) {
            //             if (v < min) min = v;
            //             if (v > max) max = v;
            //         }
            //     }
            //     if (min === max) max = min + 1; // защита от деления на ноль
            // }

            const bounds = this._canvas.bounds();
            const w = bounds.outerWidth;
            this._waterfallBuffer.push(floatArray, (ctx, freqArray) => {
                return this._createGradient(ctx, w, this._min, this._max, freqArray)
            });

            if (show) {
                this.ShowBuffer();
            }

        } catch (e) {
            console.error(e);
        }
    }

    ShowBuffer() {
        const bounds = this._canvas.bounds();
        // console.log(this._startIndex || 0, this._endIndex || this._length || 0);
        this._waterfallBuffer.draw(this._ctx, bounds.outerWidth, bounds.outerHeight, this._start || 0, this._end || 2048, this._startIndex || 0, this._endIndex || this._length || 0);
    }

    _createGradient(ctx, w, min, max, floatArray) {
        const palette = this._createPalette();
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        for (let i = 0; i < floatArray.length; i++) {
            let value = floatArray[i];
            if (isNaN(value)) value = min;

            const norm = (value - min) / (max - min); // 0..1
            const colorIndex = Math.floor(norm * (palette.length - 1));

            grad.addColorStop(i / (floatArray.length - 1), this._getColor(palette, colorIndex));
        }
        return grad;
    }

    Clear() {
        const bounds = this._canvas.bounds();
        this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });
        this._ctx.clearRect(0, 0, bounds.outerWidth, bounds.outerHeight);
        this._history.clear();
    }


}