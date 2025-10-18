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

        this._disableChangeEvent = false;
        this._maxValue = 100;
        this._minValue = 0;
        this._stepValue = 1;
        this._format = 'normal';
        this._decimal = 0;
        this._unit = '';
        this._value = [this._minValue, this._maxValue];
        this._render();
        
        this._viewPicker();
        this._showProgress();
        
        this.value = [this._minValue, this._maxValue];
        
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When the values are changed');
        this.RegisterEvent('MinChanged', false, 'When the min value is changed');
        this.RegisterEvent('MaxChanged', false, 'When the max value is changed');
        this.RegisterEvent('ProgressClicked', false, 'When the progress is clicked');
    }

    _render() {
        
        this.Clear();

        this._inputFlex = new Colibri.UI.FlexBox('inputflex', this);
        this._minText = new Colibri.UI.TextSpan('min-text', this._inputFlex);
        this._min = new Colibri.UI.Input('min', this._inputFlex);
        this._input1Text = new Colibri.UI.TextSpan('input1-text', this._inputFlex);
        this._input1 = new Colibri.UI.Input('input1', this._inputFlex);
        this._input2Text = new Colibri.UI.TextSpan('input2-text', this._inputFlex);
        this._input2 = new Colibri.UI.Input('input2', this._inputFlex);
        this._maxText = new Colibri.UI.TextSpan('max-text', this._inputFlex);
        this._max = new Colibri.UI.Input('max', this._inputFlex);

        this._pane = new Colibri.UI.Pane('pane', this);        
        this._pane.AddClass('colibri-ui-rangepicker-rangepicker-progress-pane');

        this._progress = new Colibri.UI.Pane('progress', this._pane);
        this._span1 = new Colibri.UI.Pane('span1', this._progress);
        this._span2 = new Colibri.UI.Pane('span2', this._progress);

        this._input1Text.shown = this._input2Text.shown = this._maxText.shown = this._minText.shown = 
        this._inputFlex.shown = this._input1.shown = 
        this._input2.shown = this._pane.shown = 
        this._progress.shown = this._span1.shown =
        this._span2.shown =  this._max.shown = 
        this._min.shown = true;
        
        this._input1.hasIcon = this._input1.hasClearIcon = this._max.hasIcon = this._max.hasClearIcon = false;
        this._input2.hasIcon = this._input2.hasClearIcon = this._min.hasIcon = this._min.hasClearIcon = false;

        this._input1.expandByValue = this._input2.expandByValue = this._max.expandByValue = this._min.expandByValue = true;
        this._input1.expandedMinWidth = this._input2.expandedMinWidth = this._max.expandedMinWidth = this._min.expandedMinWidth = 50;
        

        this._drag1 = new Colibri.UI.Drag(this._span1.container, this._pane.container, (newLeft, newTop) => this._span1Moved(newLeft, newTop));
        this._drag2 = new Colibri.UI.Drag(this._span2.container, this._pane.container, (newLeft, newTop) => this._span2Moved(newLeft, newTop));
        this._addHandlers();

    }

    _addHandlers() {
        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', this.__visibilityChanged);
        
        this._input1.AddHandler('ReceiveFocus', this.__input1ReceiveFocus, false, this);
        this._input1.AddHandler(['LoosedFocus', 'Changed'], this.__input1LoosedFocus, false, this);
        
        this._input2.AddHandler('ReceiveFocus', this.__input2ReceiveFocus, false, this);
        this._input2.AddHandler(['LoosedFocus', 'Changed'], this.__input2LoosedFocus, false, this);
        
        this._min.AddHandler('ReceiveFocus', this.__minReceiveFocus, false, this);
        this._min.AddHandler('Changed', this.__minChanged, false, this);
        this._min.AddHandler('LoosedFocus', this.__minLoosedFocus, false, this);

        this._max.AddHandler('ReceiveFocus', this.__maxReceiveFocus, false, this);
        this._max.AddHandler('Changed', this.__maxChanged, false, this);
        this._max.AddHandler('LoosedFocus', this.__maxLoosedFocus, false, this);
        this._progress.AddHandler('Clicked', this.__progressClicked, false, this);
    }

    __progressClicked(event, args) {
        this.Dispatch('ProgressClicked', Object.assign(args, {value: this.value}));
    }
    
    __minLoosedFocus(event, args) {
        this._min.value = this._formatNumber(parseFloat(this._min.value) / (this._unitValue ?? 1));
    }

    __maxLoosedFocus(event, args) {
        this._max.value = this._formatNumber(parseFloat(this._max.value) / (this._unitValue ?? 1));
    }
    
    __maxReceiveFocus(event, args) {
        this._max.value = parseFloat(this._maxValue / (this._unitValue ?? 1)).toMoney(this._decimal, true, '', false, '.');
    }
    __minReceiveFocus(event, args) {
        this._min.value = parseFloat(this._minValue / (this._unitValue ?? 1)).toMoney(this._decimal, true, '', false, '.');
    }

    __minChanged(event, args) {
        if(!this._disableChangeEvent) {
            this._minValue = parseFloat(this._min.value) * (this._unitValue ?? 1);
            this.Dispatch('MinChanged', {min: this._minValue, max: this._maxValue});
        }
    }

    __maxChanged(event, args) {
        if(!this._disableChangeEvent) {
            this._minValue = parseFloat(this._max.value) * (this._unitValue ?? 1);
            this.Dispatch('MaxChanged', {min: this._minValue, max: this._maxValue});
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __input1ReceiveFocus(event, args) {
        this._input1.value = parseFloat(this._value[0] / (this._unitValue ?? 1)).toMoney(this._decimal, true, '', false, '.');
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __input1LoosedFocus(event, args) {
        if(this._disableChangeEvent) {
            return;
        }

        let value = parseFloat(this._input1.value.replaceAll(',', '.'));
        if(isNaN(value)) {
            value = parseFloat(this._minValue);
        }

        this._value[0] = value * (this._unitValue ?? 1);

        this._disableChangeEvent = true;
        this._input1.value = this._formatNumber(this._value[0] / (this._unitValue ?? 1));
        this._input2.value = this._formatNumber(this._value[1] / (this._unitValue ?? 1));
        this._disableChangeEvent = false;
        this._showProgress();
        this.Dispatch('Changed', {value: this.value});

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __input2ReceiveFocus(event, args) {
        this._input2.value = parseFloat(this._value[1] / (this._unitValue ?? 1)).toMoney(this._decimal, true, '', false, '.');
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __input2LoosedFocus(event, args) {
        if(this._disableChangeEvent) {
            return;
        }

        let value = parseFloat(this._input2.value.replaceAll(',', '.'));
        if(isNaN(value)) {
            value = parseFloat(this._maxValue);
        }

        this._value[1] = this._input2.value * (this._unitValue ?? 1);

        this._disableChangeEvent = true;
        this._input1.value = this._formatNumber(this._value[0] / (this._unitValue ?? 1));
        this._input2.value = this._formatNumber(this._value[1] / (this._unitValue ?? 1));
        this._disableChangeEvent = false;
        this._showProgress();
        this.Dispatch('Changed', {value: this.value});
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
        this.Dispatch('Changed', {value: this.value});
    }

    _span2Moved(newLeft, newTop) {
        // this._progress.container.css('width', newLeft + 'px');
        this._calculateValue(null, newLeft);
        this._showProgress();
        this.Dispatch('Changed', {value: this.value});
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

        const width = parseFloat(this._pane.width) ?? 0;
        if(isNaN(width)) {
            return;
        }

        const max = parseFloat(this._maxValue);
        const min = parseFloat(this._minValue);

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

    _viewPicker() {

        const max = this._maxValue;
        const min = this._minValue;

        this._input1Text.value = '#{ui-components-rangepicker-minval}: ';
        this._input2Text.value = '#{ui-components-rangepicker-maxval}: ';
        this._maxText.value = '#{ui-components-rangepicker-max}: ';
        this._max.value = this._formatNumber(max / (this._unitValue ?? 1));
        this._minText.value = '#{ui-components-rangepicker-min}: ';
        this._min.value = this._formatNumber(min / (this._unitValue ?? 1));

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

        this._disableChangeEvent = true;
        this._input1.value = this._formatNumber(this._value[0] / (this._unitValue ?? 1));
        this._input2.value = this._formatNumber(this._value[1] / (this._unitValue ?? 1));
        this._disableChangeEvent = false;
        this._showProgress();

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
        if(!this._maxValue || this._maxValue != value) {
            this._maxValue = value;
            
            this._viewPicker();
            this._showProgress();
        }
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
        if(!this._minValue || value != this._minValue) {
            this._minValue = value;
            
            this._viewPicker();
            this._showProgress();
        }
    }

    Expand(min, max) {
        this._disableChangeEvent = true;
        this._minValue = min;
        this._maxValue = max;
        this._stepValue = this._maxValue - this._minValue;
        this._value = [this._minValue, this._maxValue];
        
        this._viewPicker();
        this._showValue();
        this._disableChangeEvent = false;
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
        
        this._viewPicker();
        this._showProgress();
    }

    CalculateStepCount(min, max) {
        return parseFloat(max) - parseFloat(min);
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
        
        this._viewPicker();
        this._showProgress();
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
        
        this._viewPicker();
        this._showProgress();
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
        
        this._viewPicker();
        this._showProgress();
    }

    /**
     * Value of unit
     * @type {Number}
     */
    get unitValue() {
        return this._unitValue;
    }
    /**
     * Value of unit
     * @type {Number}
     */
    set unitValue(value) {
        this._unitValue = value;
        
        this._viewPicker();
        this._showProgress();
    }

}