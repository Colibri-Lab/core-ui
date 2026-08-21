/**
 * Day of month
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * form.fields = {
 *      'dayofmonth': {
 *          'component': 'DayOfMonth',
 *          'desc': 'Check me',
 *          'default': ''
 *      }
 * };
 * form.value = {
 *      'dayofmonth': '01-01'
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
 *          'dayofmonth': {
 *              'component': 'DayOfMonth',
 *              'desc': 'Enter your day of month',
 *              'default': ''
 *          }
 *      }
 *     </fields>
 * </Forms.Form>
 * 
 * ```
 */
Colibri.UI.Forms.DayOfMonth = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     * @protected
     * @ignore
     */
    RenderFieldContainer() {

        this.AddClass('app-component-daymonth-field');

        const contentContainer = this.contentContainer;

        this._day = new Colibri.UI.Selector('day', contentContainer, false, false, false, this._getDays(parseInt(this._fieldData.default.split('-')[0])), parseInt(this._fieldData.default.split('-')[1]));
        this._day.shown = true;

        this._month = new Colibri.UI.Selector('month', contentContainer, false, false, false, this._getMonths(), parseInt(this._fieldData.default.split('-')[0]));
        this._month.shown = true;

        this._month.AddHandler('Changed', this.__monthChanged, false, this);
        this._month.AddHandler('KeyUp', this.__thisBubble, false, this);

        this._month.AddHandler('KeyDown', this.__thisBubble, false, this);
        this._day.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        this._day.AddHandler('KeyUp', this.__thisBubble, false, this);
        this._day.AddHandler('KeyDown', this.__thisBubble, false, this);


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

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __monthChanged(event, args) {
        this._day.values = this._getDays(this._month.value?.value ?? this._month.value);
        this.Dispatch('Changed', Object.assign(args, { component: this }));
    }

    /**
     * @ignore
     * @private
     */
    _getMonths() {
        const ret = [];
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((m) => {
            ret.push({
                value: m,
                title: (m + '').expand('0', 2)
            })
        });
        return ret;
    }

    /**
     * @ignore
     * @private
     * @param {number} month month number
     */
    _getDays(month) {
        const d = [];
        const days = new Date(Date.Now().getFullYear(), month, 0).getDate();
        for (let j = 1; j <= days; j++) {
            d.push({
                value: j,
                title: (j + '').expand('0', 2)
            });
        }
        return d;
    }

    /**
     * Focus on component
     * @public
     */
    Focus() {
        this._month.Focus()
    }

    /**
     * Get value title
     * @returns {string}
     * @public
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
Colibri.UI.Forms.Field.RegisterFieldComponent('DayOfMonth', 'Colibri.UI.Forms.DayOfMonth', '#{ui-fields-dayofmonth}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'transformer', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler'])
