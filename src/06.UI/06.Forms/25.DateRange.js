/**
 * Date range field component
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * form.fields = {
 *      'daterange': {
 *          'component': 'DateRange',
 *          'desc': 'Select range of date',
 *          'default': ''
 *      }
 * };
 * form.value = {
 *      'daterange': ['2024-01-01', '2024-01-31']
 * };
 * form.AddHandler('Changed', (event, args) => {
 *      console.log('Form changed', form.value);
 * });
 * 
 * in html template
 * 
 * <Forms.Form name="form" fields="fields" value="value">
 *     <fields>
 *      {
 *          'daterange': {
 *              'component': 'DateRange',
 *              'desc': 'Select range of date',
 *              'default': ''
 *          }
 *      }
 *     </fields>
 * </Forms.Form>
 * 
 * ```
 */
Colibri.UI.Forms.DateRange = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     * @protected
     * @ignore
     */
    RenderFieldContainer() {
        this.AddClass('app-component-daterange-field');

        const contentContainer = this.contentContainer;

        this._input1 = new Colibri.UI.DateSelector(this._name + '-input1', contentContainer);
        this._input1.shown = true;
        this._input1.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        this._input1.AddHandler('KeyUp', this.__input1KeyUp, false, this);
        this._input1.AddHandler('Clicked', this.__thisBubbleWithFocusStopPropagation, false, this);

        this._input1.AddHandler('PopupOpened', this.__inputPopupOpened, false, this);
        this._input1.AddHandler('PopupClosed', this.__inputPopupClosed, false, this);

        this._input2 = new Colibri.UI.DateSelector(this._name + '-input2', contentContainer);
        this._input2.shown = true;
        this._input2.hasIcon = false;
        this._input2.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        this._input2.AddHandler('KeyUp', this.__input2KeyUp, false, this);
        this._input2.AddHandler('Clicked', this.__thisBubbleWithFocusStopPropagation, false, this);

        this._input2.AddHandler('PopupOpened', this.__inputPopupOpened, false, this);
        this._input2.AddHandler('PopupClosed', this.__inputPopupClosed, false, this);

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

        if (this._fieldData?.params?.format) {
            let dateformat = App.DateFormat || 'ru-RU';
            this._input1.format = new Intl.DateTimeFormat(this._fieldData?.params?.format?.locale || dateformat, this._fieldData?.params?.format?.options ?? { day: '2-digit', month: 'short', year: 'numeric' });
            this._input2.format = new Intl.DateTimeFormat(this._fieldData?.params?.format?.locale || dateformat, this._fieldData?.params?.format?.options ?? { day: '2-digit', month: 'short', year: 'numeric' });
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __inputPopupOpened(event, args) {
        this.AddClass('-opened');
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __inputPopupClosed(event, args) { 
        this.RemoveClass('-opened');
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __input2KeyUp(event, args) {
        return this.Dispatch('KeyUp', Object.assign(args || {}, { component: this._input2 }));
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __input1KeyUp(event, args) {
        return this.Dispatch('KeyUp', Object.assign(args || {}, { component: this._input1 }));
    }

    /**
     * Array of two date items
     * @type {Array}
     */
    get value() {
        if (this._input1.value == 'Invalid Date' && this._input2.value == 'Invalid Date') {
            return null;
        }
        return [
            this._input1.value == 'Invalid Date' ? null : this._input1.value,
            this._input2.value == 'Invalid Date' ? null : this._input2.value
        ];
    }
    /**
     * Array of two date items
     * @type {Array}
     */
    set value(value) {
        if (!Array.isArray(value)) {
            value = [value ?? '', ''];
        }

        if(!(value[0] instanceof Date)) {
            value[0] = value[0]?.toDate() ?? null;
        }
        if(!(value[1] instanceof Date)) {
            value[1] = value[1]?.toDate() ?? null;
        }

        this._input1.value = value[0] !== undefined ? value[0] : null;
        this._input2.value = value[1] !== undefined ? value[1] : null;
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
        if(value) {
            this.RemoveClass('app-component-disabled');
            this._input1.RemoveClass('app-component-disabled');
            this._input2.RemoveClass('app-component-disabled');
        }
        else {
            this.AddClass('app-component-disabled');
            this._input1.AddClass('app-component-disabled');
            this._input2.AddClass('app-component-disabled');
        }

    }

}

Colibri.UI.Forms.Field.RegisterFieldComponent('DateRange', 'Colibri.UI.Forms.DateRange', '#{ui-fields-daterange}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'transformer', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler'])
