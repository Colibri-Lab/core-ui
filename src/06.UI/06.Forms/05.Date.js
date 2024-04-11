/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Date = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-date-field');


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
        
        this._icon = new Colibri.UI.Icon(this.name + '-clear', contentContainer);
        this._icon.shown = true;
        this._icon.value = Colibri.UI.ClearIcon;
        this._icon.AddHandler('Clicked', (event, args) => {
            this.value = null;
        });


        this._input.AddHandler('PopupOpened', (event, args) => this.AddClass('-opened'));
        this._input.AddHandler('PopupClosed', (event, args) => this.RemoveClass('-opened'));

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
     * Field is readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.readonly;
    }

    /**
     * Field is readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._input.readonly = value;
    }

    /**
     * Field placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.placeholder;
    }

    /**
     * Field placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.placeholder = value;
    }

    /**
     * Value
     * @type {Date}
     */
    get value() {
        let value = this._input.value;
        return (value?.toString() === 'Invalid Date' ? null : value.toShortDateString());
    }

    /**
     * Value
     * @type {Date}
     */
    set value(value) {
        if(typeof value == 'string') {
            value = new Date(value);
        }
        this._input.value = value;
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
        this._icon.shown = value;
    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Tab index
     * @type {number|boolean}
     */
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Date', 'Colibri.UI.Forms.Date', '#{ui-fields-date}');