/**
 * Timeline
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.Timeline = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Timeline']);
        this.AddClass('colibri-ui-timeline');

        this._disableChangeEvent = false;
        this._render();

        this._viewPicker();
        this._addHandlers();
        this._showProgress();
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
    }

    _render() {
        
        this._inputFlex = new Colibri.UI.FlexBox('inputflex', this);
        this._input1 = new Colibri.UI.DateTimeSelector('input1', this._inputFlex);
        this._minText = new Colibri.UI.TextSpan('min-text', this._inputFlex);
        this._min = new Colibri.UI.DateTimeSelector('min', this._inputFlex);
        this._maxText = new Colibri.UI.TextSpan('max-text', this._inputFlex);
        this._max = new Colibri.UI.DateTimeSelector('max', this._inputFlex);
        this._input2 = new Colibri.UI.DateTimeSelector('input2', this._inputFlex);

        this._pane = new Colibri.UI.Pane('pane', this);        
        this._pane.AddClass('colibri-ui-rangepicker-rangepicker-progress-pane');

        this._progress = new Colibri.UI.Pane('progress', this._pane);
        this._span1 = new Colibri.UI.Pane('span1', this._progress);
        this._span2 = new Colibri.UI.Pane('span2', this._progress);

        this._inputFlex.shown = this._input1.shown = 
        this._input2.shown = this._pane.shown = 
        this._progress.shown = this._span1.shown =
        this._span2.shown =  this._max.shown = 
        this._min.shown = this._minText.shown = this._maxText.shown = true;
        
        this._input1.hasIcon = this._input2.hasIcon = this._min.hasIcon = this._max.hasIcon = false;
        this._input1.hasClearIcon = this._input2.hasClearIcon = this._min.hasClearIcon = this._max.hasClearIcon = false;

        this._drag1 = new Colibri.UI.Drag(this._span1.container, this._pane.container, (newLeft, newTop) => this._span1Moved(newLeft, newTop));
        this._drag2 = new Colibri.UI.Drag(this._span2.container, this._pane.container, (newLeft, newTop) => this._span2Moved(newLeft, newTop));

    }

    _addHandlers() {
        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', this.__visibilityChanged);
        this._input1.AddHandler('ReceiveFocus', this.__input1ReceiveFocus, false, this);
        this._input1.AddHandler(['LoosesFocus', 'Changed'], this.__input1LoosesFocus, false, this);
        this._input2.AddHandler('ReceiveFocus', this.__input2ReceiveFocus, false, this);
        this._input2.AddHandler(['LoosesFocus', 'Changed'], this.__input2LoosesFocus, false, this);
        this._min.RemoveHandler('Changed', this.__minChanged, this);
        this._min.AddHandler('Changed', this.__minChanged, false, this);
        this._max.RemoveHandler('Changed', this.__maxChanged, this);
        this._max.AddHandler('Changed', this.__maxChanged, false, this);
    }

    __minChanged(event, args) {
        this.Dispatch('MinChanged', {min: this._min.value, max: this._max.value});
    }

    __maxChanged(event, args) {
        this.Dispatch('MaxChanged', {min: this._min.value, max: this._max.value});
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
        if(this._disableChangeEvent) {
            return;
        }
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
        if(this._disableChangeEvent) {
            return;
        }
        this.value = [this._input1.value, this._input2.value];
        this._showProgress();
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

    _setLeftPoint(left) {
        const width = this._pane.width;
        const perc = (left) * 100 / width;
        const max = this._maxValue.toUnixTime();
        const min = this._minValue.toUnixTime();
        const step = this._stepValue;

        let newValue = min + ((max - min) * perc / 100);
        // newValue = Math.ceil(newValue / step) * step - step;
        if(newValue >= max) {
            newValue = max;
        }
        if(newValue <= min) {
            newValue = min;
        }
        this.value = [newValue.toDateFromUnixTime(), this._value[1]];

    }

    _setRightPoint(left) {
        const width = this._pane.width;
        const perc = (left + 8) * 100 / width;
        const max = this._maxValue.toUnixTime();
        const min = this._minValue.toUnixTime();
        const step = this._stepValue;

        let newValue = min + ((max - min) * perc / 100);
        // newValue = Math.ceil(newValue / step) * step + step;
        if(newValue >= max) {
            newValue = max;
        }
        if(newValue <= min) {
            newValue = min;
        }

        this.value = [this._value[0], newValue.toDateFromUnixTime()];

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
        try {

            let value = this._value;
    
            const width = this._pane.width;
    
            const max = this._maxValue.toUnixTime();
            const min = this._minValue.toUnixTime();
    
            // max - min = 100
            // value - min = x
            // x = (min + value) * 100 / (max - min)
            const perc1 = (value[0].toUnixTime() - min) * 100 / (max - min);
            const perc2 = (value[1].toUnixTime() - min) * 100 / (max - min);
    
            // width = 100
            // left = perc
            
            const perc = width * perc1 / 100;
            const percWidth = width * perc2 / 100;

            this._progress.container.css('width', (percWidth - perc) + 'px');
            this._progress.container.css('left', perc + 'px');
        } catch(e) {
            
        }

    }

    _viewPicker() {

        this._maxText.value = '#{ui-components-timeline-max}: ';
        this._max.value = this._maxValue;
        this._minText.value = '#{ui-components-timeline-min}: ';
        this._min.value = this._minValue;

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
     * @type {Array<Date>}
     */
    get value() {
        return this._value;
    }
    /**
     * 
     * @type {Array<Date>}
     */
    set value(value) {
        value = this._convertProperty('Array', value);
        this._value = value;

        const max = this._maxValue;
        const min = this._minValue;
        const step = this._stepValue;

        if(!value) {
            value = [min, max];
        } else if(!Array.isArray(value) && value.isDate()) {
            value = [value, max];
        }

        if(!(value[0] instanceof Date)) {
            value[0] = value[0].toDate();
        }
        if(!(value[1] instanceof Date)) {
            value[1] = value[1].toDate();
        }
        
        let left1 = value[0];
        let left2 = value[1];

        if(left1 >= max) {
            left1 = max;
        }
        if(left1 <= min || left1 == 'Invalid Date') {
            left1 = min;
        }

        if(left2 >= max || left2 == 'Invalid Date') {
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
        this._input1.value = this._value[0];
        this._input2.value = this._value[1];
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

    
    _formatDate(v) {
        if(!v) {
            return '';
        }
        return (v instanceof Date ? v : v.toDate())?.intlFormat(true) ?? '';
    }

    /**
     * Maximum number of picker
     * @type {Date}
     */
    get max() {
        return this._maxValue;
    }
    /**
     * Maximum number of picker
     * @type {Date}
     */
    set max(value) {
        value = this._convertProperty('Date', value);
        if(!this._maxValue || this._maxValue.getTime() != value.getTime()) {
            this._maxValue = value;
            
            this._viewPicker();
            this._addHandlers();
            this._showProgress();
        }
    }

    /**
     * Minimum value of picker
     * @type {Date}
     */
    get min() {
        return this._minValue;
    }
    /**
     * Minimum value of picker
     * @type {Date}
     */
    set min(value) {
        value = this._convertProperty('Date', value);
        if(!this._minValue || value.getTime() != this._minValue.getTime()) {
            this._minValue = value;
            
            this._viewPicker();
            this._addHandlers();
            this._showProgress();
        }
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
        this._addHandlers();
        this._showProgress();
    }

}