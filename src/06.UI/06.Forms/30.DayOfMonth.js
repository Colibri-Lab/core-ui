/**
 * Day of month
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.DayOfMonth = class extends Colibri.UI.Forms.Field {
    
    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-monthyear-field');

        const contentContainer = this.contentContainer;
        this._month = new Colibri.UI.Selector('month', contentContainer, false, false, false, this._getMonths(), parseInt(this._fieldData.default.split('-')[0]));
        this._month.shown = true;

        this._day = new Colibri.UI.Selector('day', contentContainer, false, false, false, this._getDays(parseInt(this._fieldData.default.split('-')[0])), parseInt(this._fieldData.default.split('-')[1]));
        this._day.shown = true;

        this._month.AddHandler('Changed', (event, args) => {
            this._day.values = this._getDays(this._month.value?.value ?? this._month.value);
            this.Dispatch('Changed', Object.assign(args, {component: this}));
        });
        this._month.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp'));
        this._month.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown'));

        this._day.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args, {component: this})));
        this._day.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp'));
        this._day.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown'));

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

    _getMonths() {
        const ret = [];
        [1,2,3,4,5,6,7,8,9,10,11,12].forEach((m) => {
            ret.push({
                value: m,
                title: (m + '').expand('0', 2)
            })
        });
        return ret;
    }

    _getDays(month) {
        const d = [];
        const days = new Date(Date.Now().getFullYear(), month, 0).getDate();
        for(let j=1; j<=days; j++) {
            d.push({
                value: j,
                title: (j + '').expand('0', 2)
            });
        }
        return d;
    }

    /**
     * Focus on component
     */
    Focus() {
        this._month.Focus()
    }

    /**
     * Get value title
     * @returns {string}
     */
    getValueTitle() {
        return this._month.value.title + ' ' + this._year.value.title;
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return (this._month?.value?.value ?? '') + '-' + (this._day?.value?.value ?? '');
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        const parts = value.split('-');
        this._month.value = parts[0];
        this._day.value = parts[1];
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._day.readonly;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._month.readonly = value;
        this._day.readonly = value;
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._day && this._day.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        if (this._day) {
            this._day.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('DayOfMonth', 'Colibri.UI.Forms.DayOfMonth', '#{ui-fields-dayofmonth}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])
