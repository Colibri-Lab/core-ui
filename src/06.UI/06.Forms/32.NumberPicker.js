Colibri.UI.Forms.NumberPicker = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        this.AddClass('app-component-numberpicker-field');
        const contentContainer = this.contentContainer;

        this._flex = new Colibri.UI.FlexBox(this.name + '_flex', contentContainer);
        this._flex.AddClass('app-component-numberpicker-flex');

        this._input = new Colibri.UI.Input(this.name + '_input', this._flex);
        this._pane = new Colibri.UI.Pane(this.name + '_pane', this._flex);
        this._pane.AddClass('app-component-numberpicker-progress-pane');
        this._maxmin = new Colibri.UI.FlexBox(this.name + '_maxmin', this._flex);
        this._maxmin.AddClass('app-component-numberpicker-maxmin');

        this._progress = new Colibri.UI.Pane(this.name + '_progress', this._pane);
        this._span = new Colibri.UI.Pane(this.name + '_span', this._progress);

        this._min = new Colibri.UI.TextSpan(this.name + '_min', this._maxmin);
        this._max = new Colibri.UI.TextSpan(this.name + '_max', this._maxmin);

        this._flex.shown = this._input.shown = this._pane.shown =
            this._progress.shown = this._span.shown =
            this._maxmin.shown = this._span.shown =
            this._max.shown = this._min.shown = true;

        this._input.hasIcon = false;
        this._input.hasClearIcon = false;

        this._drag = new Colibri.UI.Drag(this._span.container, this._pane.container, (newLeft, newTop) => this._spanMoved(newLeft, newTop));

        if (this._fieldData.picker) {
            this._step = this._fieldData.picker.step;
        }
        else {
            this._step = 1;
        }

        this._viewPicker();
        this._addHandlers();

    }

    _addHandlers() {
        this._input.AddHandler('ReceiveFocus', this.__inputReceiveFocus, false, this);
        this._input.AddHandler(['LoosesFocus', 'Changed'], this.__inputLoosesFocus, false, this);
    }

    _spanMoved(newLeft, newTop) {
        this._progress.container.css('width', newLeft + 'px');
        this._calculateValue(newLeft);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __inputReceiveFocus(event, args) {
        this._input.value = parseInt(this._input.value);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __inputLoosesFocus(event, args) {
        this.value = this._input.value;
        this._showProgress();
    }


    _calculateValue(left) {
        const width = this._pane.width;
        const perc = Math.ceil((left + 8) * 100 / width);
        const max = parseFloat(this._fieldData.picker.max);
        const min = parseFloat(this._fieldData.picker.min);
        const step = parseFloat(this._fieldData.picker.step);

        let newValue = Math.ceil(min + ((max - min) * perc / 100));
        newValue = Math.ceil(newValue / step) * step + step;
        if (newValue > max) {
            newValue = max;
        }
        if (newValue < min) {
            newValue = min;
        }
        this.value = newValue;
    }

    _showProgress() {
        let value = this._value;
        const width = this._pane.width;
        const max = this._fieldData.picker.max;
        const min = this._fieldData.picker.min;

        // max - min = 100
        // value - min = x
        // x = (min + value) * 100 / (max - min)
        const perc = (value - min) * 100 / (max - min);

        // width = 100
        // left = perc

        const left = width * perc / 100;
        this._progress.container.css('width', (left - 8) + 'px');


    }

    _viewPicker() {

        if (this._fieldData.picker) {
            const max = this._fieldData.picker.max;
            const min = this._fieldData.picker.min;
            this._max.value = this._formatNumber(max);
            this._min.value = this._formatNumber(min);
        }

    }

    _formatNumber(v) {

        const unit = this._fieldData.picker?.unit;
        const format = this._fieldData.picker?.format ?? 'normal';
        const decimal = this._fieldData.picker?.decimal ?? 2;

        v = parseFloat(v);

        if (format === 'money') {
            const formatter = new Intl.NumberFormat(App.NumberFormat, { style: 'currency', currency: App.Currency.code, maximumFractionDigits: decimal });
            v = formatter.format(v);
        }
        else if (format === 'percent') {
            const formatter = new Intl.NumberFormat(App.NumberFormat, { style: 'percent', maximumFractionDigits: decimal, minimumFractionDigits: decimal });
            if (v > 1) {
                v = v / 100;
            }
            v = formatter.format(v);
        }
        else {
            v = v.toMoney(decimal);
            if (unit) {
                v = v + ' ' + (Array.isArray(unit) ? parseFloat(v).formatSequence(unit) : unit);
            }
        }

        return v;
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
        super.shown = value;
        Colibri.Common.Delay(100).then(() => {
            this._showProgress();
        })
    }

    /**
     * 
     * @type {number}
     */
    get value() {
        return this._value;
    }
    /**
     * 
     * @type {number}
     */
    set value(value) {

        const max = this._fieldData.picker.max;
        const min = this._fieldData.picker.min;
        const step = this._fieldData.picker.step;
        value = parseInt(value);
        value = Math.ceil(value / step) * step;
        if (value > max) {
            value = max;
        }
        if (value < min) {
            value = min;
        }

        this._value = value;
        this._showValue();
    }
    _showValue() {

        if (this._value === null) {
            this._value = 0;
        }

        this._input.value = this._formatNumber(this._value);

    }

    /**
     * Табуляция
     * @type {number}
     */
    get tabIndex() {
        return this._input.tabIndex;
    }
    /**
     * Табуляция
     * @type {number}
     */
    set tabIndex(value) {
        this._input.tabIndex = value;
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('NumberPicker', 'Colibri.UI.Forms.NumberPicker', '#{ui-fields-numberpicker}', Colibri.UI.FieldIcons['Colibri.UI.Forms.Number']);
