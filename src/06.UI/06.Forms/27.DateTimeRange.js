/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.DateTimeRange = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-datetimerange-field');


        const contentContainer = this.contentContainer;

        this._flex1 = new Colibri.UI.FlexBox(this._name + '-flex1', contentContainer);
        this._flex2 = new Colibri.UI.FlexBox(this._name + '-flex2', contentContainer);
        this._flex1.shown = this._flex2.shown = true;

        this._input1 = new Colibri.UI.DateSelector(this._name + '-input1', this._flex1);
        this._input1.shown = true;
        this._input1.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input1.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input1.AddHandler('Clicked', (event, args) => {
            this.Dispatch('Clicked', args);
            args.domEvent.stopPropagation();
            return false;
        });

        this._time1 = new Colibri.UI.Input(this._name + '-time1', this._flex1);
        this._time1.shown = true;
        this._time1.hasIcon = false;
        this._time1.hasClearIcon = false;
        this._time1.mask = '99:99:99';

        this._input2 = new Colibri.UI.DateSelector(this._name + '-input2', this._flex2);
        this._input2.shown = true;
        this._input2.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input2.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input2.AddHandler('Clicked', (event, args) => {
            this.Dispatch('Clicked', args);
            args.domEvent.stopPropagation();
            return false;
        });

        this._time2 = new Colibri.UI.Input(this._name + '-time2', this._flex2);
        this._time2.shown = true;
        this._time2.hasIcon = false;
        this._time2.hasClearIcon = false;
        this._time2.mask = '99:99:99';


        this._icon = new Colibri.UI.Icon(this.name + '-clear', contentContainer);
        this._icon.shown = true;
        this._icon.value = Colibri.UI.ClearIcon;
        this._icon.AddHandler('Clicked', (event, args) => {
            this.value = [null,null];
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
        this._input2.readonly = value;
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._placeholder;
    }

    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._placeholder = value;
        this._input1.placeholder = this._placeholder + ' (#{ui-fields-datetimerage-from})';
        this._input2.placeholder = this._placeholder + ' (#{ui-fields-datetimerage-to})';
    }

    /**
     * Value
     * @type {Array<Date>}
     */
    get value() {
        let value1 = this._input1.value;
        let value2 = this._input2.value;
        let timeValue1 = this._time1.value;
        let timeValue2 = this._time2.value;
        
        value1 = (value1?.toString() === 'Invalid Date' ? null : value1.toShortDateString());
        value2 = (value2?.toString() === 'Invalid Date' ? null : value2.toShortDateString());
        return [value1 ? value1 + ' ' + timeValue1 : null, value2 ? value2 + ' ' + timeValue2 : null];
    }

    /**
     * Value
     * @type {Array<Date>}
     */
    set value(value) {
        if(!Array.isArray(value)) {
            value = [value ?? '', ''];
        }
        if(typeof value[0] == 'string') {
            value[0] = new Date(value[0]);
        }
        if(typeof value[1] == 'string') {
            value[1] = new Date(value[1]);
        }
        this._input1.value = value[0];
        this._input2.value = value[1];
        this._time1.value = value[0] instanceof Date ? value[0].toTimeString() : '';
        this._time1.value = value[1] instanceof Date ? value[1].toTimeString() : '';

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
            this._input1.tabIndex = value;
        }
        if (this._input2) {
            this._input2.tabIndex = value + 1;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('DateTimeRange', 'Colibri.UI.Forms.DateTimeRange', '#{ui-fields-datetimerage}');