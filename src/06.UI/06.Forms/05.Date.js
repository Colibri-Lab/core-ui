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
        this._input.clearIcon = false;
        this._input.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        this._input.AddHandler('KeyUp', this.__thisBubble, false, this);
        this._input.AddHandler('Clicked', this.__inputClicked, false, this);

        this._icon = new Colibri.UI.Icon(this.name + '-clear', contentContainer);
        this._icon.shown = true;
        this._icon.value = Colibri.UI.ClearIcon;
        this._icon.AddHandler('Clicked', this.__clearClicked, false, this);

        this._input.AddHandler('PopupOpened', this.__inputPopupOpened, false, this);
        this._input.AddHandler('PopupClosed', this.__inputPopupClosed, false, this);

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

        this._input.clearIcon = this._fieldData?.params?.dateselectorclear ?? false;
        this._min = this._fieldData?.params?.min ? new Date(this._fieldData?.params?.min + ' 00:00:00') : new Date(-8640000000000000);
        this._max = this._fieldData?.params?.max ? new Date(this._fieldData?.params?.max + ' 23:59:59') : new Date(8640000000000000);
        this._todayDate = this._fieldData?.params?.today ? new Date(this._fieldData?.params?.today) : null;
        this._todayString = this._fieldData?.params?.today_title ?? null;
        this._input.min = this._min;
        this._input.max = this._max;
        this._input.todayDate = this._todayDate;
        this._input.todayString = this._todayString;

    }

    __inputPopupOpened(event, args) {
        this.AddClass('-opened');
    }
    __inputPopupClosed(event, args) {
        this.RemoveClass('-opened');
    }

    __clearClicked(event, args) {
        this.value = null;
    }

    __inputClicked(event, args) {
        this.Focus();
        this.Dispatch('Clicked', args);
        args.domEvent.stopPropagation();
        return false;
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
        if (typeof value == 'string') {
            value = new Date(value);
        }
        if (value < this._min) {
            return;
        } else if (value > this._max) {
            return;
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
Colibri.UI.Forms.Field.RegisterFieldComponent('Date', 'Colibri.UI.Forms.Date', '#{ui-fields-date}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler']);