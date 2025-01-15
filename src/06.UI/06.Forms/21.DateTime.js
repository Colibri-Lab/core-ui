/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.DateTime = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-datetime-field');


        const contentContainer = this.contentContainer;

        this._input = new Colibri.UI.DateSelector(this._name + '-input', contentContainer);
        this._input.shown = true;
        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('Clicked', (event, args) => {
            this.Focus();
            this.Dispatch('Clicked', args);
            args.domEvent.stopPropagation();
            return false;
        });

        this._time = new Colibri.UI.Input(this._name + '-time', contentContainer);
        this._time.shown = true;
        this._time.hasIcon = false;
        this._time.hasClearIcon = false;
        this._time.mask = '99:99:99';

        this._icon = new Colibri.UI.Icon(this.name + '-clear', contentContainer);
        this._icon.shown = true;
        this._icon.value = Colibri.UI.ClearIcon;
        this._icon.AddHandler('Clicked', (event, args) => {
            this.value = null;
        });

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

    }

    /**
     * Focus on component
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.readonly;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._input.readonly = value;
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.placeholder;
    }

    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.placeholder = value;
    }

    /**
     * Value
     * @type {Date|string}
     */
    get value() {
        let value = this._input.value;
        let timeValue = this._time.value;
        
        value = (value?.toString() === 'Invalid Date' ? null : value.toShortDateString());
        return value ? value + ' ' + timeValue : null;
    }

    /**
     * Value
     * @type {Date|string}
     */
    set value(value) {
        // may be this is a timestamp value
        if (value && value.isNumeric()) {
            value = new Date(value * 1000);
        } else if (value && typeof value == 'string') {
            value = new Date(value);
        }
        this._input.value = value;
        this._time.value = value instanceof Date ? value.toTimeString() : '';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._input.enabled;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        this._input.enabled = value;
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('DateTime', 'Colibri.UI.Forms.DateTime', '#{ui-fields-datetime}');