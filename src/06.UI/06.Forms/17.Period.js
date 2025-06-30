/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Period = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-period-field');

        const contentContainer = this.contentContainer;

        this._input1 = new Colibri.UI.DateSelector(this._name + '-input1', contentContainer);
        this._input1.shown = true;
        this._input1.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args ?? {}, { component: this })));
        this._input1.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));

        this._input2 = new Colibri.UI.DateSelector(this._name + '-input2', contentContainer);
        this._input2.shown = true;
        this._input2.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args ?? {}, { component: this })));
        this._input2.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));

        this._text = new Colibri.UI.TextSpan(this._name + '-text', contentContainer);
        this._text.shown = true;

        this.AddHandler('Changed', this.__thisChanged);

        if (this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if (this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        if (this._fieldData?.params?.days !== undefined) {
            this._text.shown = this._fieldData?.params?.days;
        }

    }

    __thisChanged(event, args) {
        if (this._input1.value != 'Invalid Date' && this._input2.value != 'Invalid Date') {
            const days = parseInt((this._input2.value.getTime() - this._input1.value.getTime()) / 1000 / 86400) + 1;
            this._text.value = days.formatSequence(['#{ui-period-day1}', '#{ui-period-day2}', '#{ui-period-day3}'], true);
        }
        else {
            this._text.value = '';
        }
    }

    /**
     * Focus on component
     */
    Focus() {
        this._input1.Focus();
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input1.readonly;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._input1.readonly = value;
    }

    /**
     * Field placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input2.placeholder ? [this._input1.placeholder, this._input2.placeholder] : this._input1.placeholder;
    }

    /**
     * Field placeholder
     * @type {string}
     */
    set placeholder(value) {
        if (Array.isArray(value)) {
            value[0] = this._convertProperty('String', value[0]);
            value[1] = this._convertProperty('String', value[1]);
            this._input1.placeholder = value[0];
            this._input2.placeholder = value[1];

        } else {
            value = this._convertProperty('String', value);
            this._input1.placeholder = value;
        }
    }

    /**
     * Value
     * @type {Array}
     */
    get value() {
        let input1 = this._input1.value != 'Invalid Date' ? this._input1.value.toShortDateString() : this._input1.value;
        let input2 = this._input2.value != 'Invalid Date' ? this._input2.value.toShortDateString() : this._input2.value;
        return [input1, input2];
    }

    /**
     * Value
     * @type {Array}
     */
    set value(value) {
        this._input1.value = value ? value[0] : null;
        this._input2.value = value ? value[1] : null;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._input1.enabled;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        this._input1.enabled = value;
        this._input2.enabled = value;
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input1 && this._input1.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        if (this._input1) {
            this._input1.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Period', 'Colibri.UI.Forms.Period', '#{ui-fields-period}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler'])
