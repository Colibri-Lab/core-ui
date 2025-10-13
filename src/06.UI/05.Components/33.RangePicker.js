/**
 * Range picker component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.RangePicker = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.RangePicker']);
        this.AddClass('colibri-ui-rangepicker');

        this._maxValue = 100;
        this._minValue = 0;
        this._stepValue = 1;
        this._format = 'normal';
        this._decimal = 0;
        this._unit = '';
        this._value = [this._minValue, this._maxValue];
        this._render();
        this.value = [this._minValue, this._maxValue];
        
    }

    _render() {
        
        this.Clear();

        this._inputFlex = new Colibri.UI.FlexBox('inputflex', this);
        this._input1 = new Colibri.UI.Input('input1', this._inputFlex);
        this._min = new Colibri.UI.TextSpan('min', this._inputFlex);
        this._max = new Colibri.UI.TextSpan('max', this._inputFlex);
        this._input2 = new Colibri.UI.Input('input2', this._inputFlex);

        this._pane = new Colibri.UI.Pane('pane', this);        
        this._pane.AddClass('colibri-ui-rangepicker-rangepicker-progress-pane');

        this._progress = new Colibri.UI.Pane('progress', this._pane);
        this._span1 = new Colibri.UI.Pane('span1', this._progress);
        this._span2 = new Colibri.UI.Pane('span2', this._progress);

        this._inputFlex.shown = this._input1.shown = 
        this._input2.shown = this._pane.shown = 
        this._progress.shown = this._span1.shown =
        this._span2.shown =  this._max.shown = 
        this._min.shown = true;
        
        this._input1.hasIcon = false;
        this._input1.hasClearIcon = false;
        this._input2.hasIcon = false;
        this._input2.hasClearIcon = false;

        this._drag1 = new Colibri.UI.Drag(this._span1.container, this._pane.container, (newLeft, newTop) => this._span1Moved(newLeft, newTop));
        this._drag2 = new Colibri.UI.Drag(this._span2.container, this._pane.container, (newLeft, newTop) => this._span2Moved(newLeft, newTop));

        this._viewPicker();
        this._addHandlers();

    }

    __input1Focus(event, args) {
        this._input1.value = parseFloat(this._input1.value);
    }
    __input1LoosesFocus(event, args) {
        this._input1.value = this._formatNumber(this._input1.value);        
    }

    __input2Focus(event, args) {
        this._input2.value = parseFloat(this._input2.value);
    }
    __input2LoosesFocus(event, args) {
        this._input2.value = this._formatNumber(this._input2.value);        
    }

    _addHandlers() {
        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', this.__visibilityChanged);
        this._input1.AddHandler('ReceiveFocus', this.__input1ReceiveFocus, false, this);
        this._input1.AddHandler(['LoosesFocus', 'Changed'], this.__input1LoosesFocus, false, this);
        this._input2.AddHandler('ReceiveFocus', this.__input2ReceiveFocus, false, this);
        this._input2.AddHandler(['LoosesFocus', 'Changed'], this.__input2LoosesFocus, false, this);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __visibilityChanged(event, args) {
        this._showProgress();
    }

    _span1Moved(newLeft, newTop) {
        // this._progress.container.css('left', newLeft + 'px');
        this._calculateValue(newLeft, null);
        this._showProgress();
    }

    _span2Moved(newLeft, newTop) {
        // this._progress.container.css('width', newLeft + 'px');
        this._calculateValue(null, newLeft);
        this._showProgress();
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __input1ReceiveFocus(event, args) {
        this._input1.value = this._value[0];
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __input1LoosesFocus(event, args) {
        this.value = [this._input1.value, this._input2.value];
        this._showProgress();
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __input2ReceiveFocus(event, args) {
        this._input2.value = this._value[1];
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __input2LoosesFocus(event, args) {
        this.value = [this._input1.value, this._input2.value];
        this._showProgress();
    }

    _setLeftPoint(left) {
        const width = this._pane.width;
        const perc = (left) * 100 / width;
        const max = this._maxValue;
        const min = this._minValue;
        const step = this._stepValue;

        let newValue = min + ((max - min) * perc / 100);
        // newValue = Math.ceil(newValue / step) * step - step;
        if(newValue >= max) {
            newValue = max;
        }
        if(newValue <= min) {
            newValue = min;
        }
        console.log(newValue);
        this.value = [newValue, this._value[1]];

    }

    _setRightPoint(left) {
        const width = this._pane.width;
        const perc = (left + 8) * 100 / width;
        const max = this._maxValue;
        const min = this._minValue;
        const step = this._stepValue;

        let newValue = min + ((max - min) * perc / 100);
        // newValue = Math.ceil(newValue / step) * step + step;
        if(newValue >= max) {
            newValue = max;
        }
        if(newValue <= min) {
            newValue = min;
        }

        this.value = [this._value[0], newValue];

    }


    _calculateValue(left1, left2) {
        if(left1 !== null) {
            this._setLeftPoint(left1);
        }
        else if(left2 !== null) {
            this._setRightPoint(left2);
        }
    }

    _showProgress() {
        let value = this._value;

        const width = this._pane.width;
        const max = this._maxValue;
        const min = this._minValue;

        // max - min = 100
        // value - min = x
        // x = (min + value) * 100 / (max - min)
        const perc1 = (value[0] - min) * 100 / (max - min);
        const perc2 = (value[1] - min) * 100 / (max - min);

        // width = 100
        // left = perc
        
        const perc = width * perc1 / 100;
        const percWidth = width * perc2 / 100;
        this._progress.container.css('width', (percWidth - perc) + 'px');
        this._progress.container.css('left', perc + 'px');

    }

    _viewPicker() {

        const max = this._maxValue;
        const min = this._minValue;

        this._max.value = '#{ui-components-rangepicker-max}: ' + this._formatNumber(max);
        this._min.value = '#{ui-components-rangepicker-min}: ' + this._formatNumber(min);

    }

    /**
     * Показать/не показывать
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }
    /**
     * Показать/не показывать
     * @type {boolean}
     */
    set shown(value) {
        value = this._convertProperty('Boolean', value);
        super.shown = value;
        Colibri.Common.Delay(100).then(() => {
            this._showProgress();
        })
    }

    /**
     * 
     * @type {Array}
     */
    get value() {
        return this._value;
    }
    /**
     * 
     * @type {Array}
     */
    set value(value) {

        value = this._convertProperty('Array', value);
        this._value = value;

        const max = this._maxValue;
        const min = this._minValue;
        const step = this._stepValue;

        if(!value) {
            value = [min, max];
        } else if(!Array.isArray(value) && value.isNumeric()) {
            value = [value, max];
        }
        
        let left1 = parseFloat(value[0]);
        let left2 = parseFloat(value[1]);

        // left1 = Math.ceil(left1 / step) * step;
        if(left1 >= max) {
            left1 = max;
        }
        if(left1 <= min) {
            left1 = min;
        }

        // left2 = Math.ceil(left2 / step) * step;
        if(left2 >= max) {
            left2 = max;
        }
        if(left2 <= min) {
            left2 = min;
        }

        this._value = [left1, left2];
        this._showValue();
    }
    _showValue() {
        const max = this._maxValue;
        const min = this._minValue;

        if(this._value === null) {
            this._value = [min, max];
        }

        this._input1.value = this._formatNumber(this._value[0]);
        this._input2.value = this._formatNumber(this._value[1]);

    }

    /**
     * Табуляция
     * @type {number}
     */
    get tabIndex() {
        return this._input1.tabIndex;
    }
    /**
     * Табуляция
     * @type {number}
     */
    set tabIndex(value) {
        this._input1.tabIndex = value;
    }

    
    _formatNumber(v) {

        const unit = Lang.Translate(this._unit);
        const format = this._format ?? 'normal';
        const decimal = this._decimal ?? 2;

        v = parseFloat(v);

        if(format === 'money') {
            const formatter = new Intl.NumberFormat(App.NumberFormat, {style: 'currency', currency: App.Currency.code, maximumFractionDigits: decimal});
            v = formatter.format(v);
        }
        else if(format === 'percent') {
            const formatter = new Intl.NumberFormat(App.NumberFormat, {style: 'percent', maximumFractionDigits: decimal, minimumFractionDigits: decimal});
            if(v > 1) {
                v = v / 100;
            }
            v = formatter.format(v);
        }
        else {
            v = v.toMoney(decimal);
            if(unit) {
                v = v + ' ' + (Array.isArray(unit) ? parseFloat(v).formatSequence(unit) : unit);
            }
        }

        return v;
    }

    /**
     * Maximum number of picker
     * @type {Number}
     */
    get max() {
        return this._maxValue;
    }
    /**
     * Maximum number of picker
     * @type {Number}
     */
    set max(value) {
        this._maxValue = value;
        this._render();
    }

    /**
     * Minimum value of picker
     * @type {Number}
     */
    get min() {
        return this._minValue;
    }
    /**
     * Minimum value of picker
     * @type {Number}
     */
    set min(value) {
        this._minValue = value;
        this._render();
    }

    /**
     * Step
     * @type {Number}
     */
    get step() {
        return this._stepValue;
    }
    /**
     * Step
     * @type {Number}
     */
    set step(value) {
        this._stepValue = value;
        this._render();
    }

    /**
     * Unit of value to show
     * @type {String}
     */
    get unit() {
        return this._unit;
    }
    /**
     * Unit of value to show
     * @type {String}
     */
    set unit(value) {
        this._unit = value;
        this._render();
    }

    /**
     * Format of value
     * @type {money,percent,normal}
     */
    get format() {
        return this._format;
    }
    /**
     * Format of value
     * @type {money,percent,normal}
     */
    set format(value) {
        this._format = value;
        this._render();
    }

    /**
     * Decimal count
     * @type {Number}
     */
    get decimal() {
        return this._decimal;
    }
    /**
     * Decimal count
     * @type {Number}
     */
    set decimal(value) {
        this._decimal = value;
        this._render();
    }

}