/**
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI
 */
Colibri.UI.YearMonthSelector = class extends Colibri.UI.FlexBox {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {Array} values values to show
     */    
    constructor(name, container, values = null) {
        super(name, container);
        this.AddClass('app-component-year-month-selector');

        this._values = values;

        this._selector = new Colibri.UI.Selector(this.name + '-selector', this);
        this._selector.searchable = false;
        this._selector.readonly = false;
        this._selector.shown = true;

        this._selector.AddHandler('Changed', (event, args) => this.__selectorChanged(event, args));

    }
    
    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Когда значение изменилось');
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __selectorChanged(event, args) {
        this.Dispatch('Changed', Object.assign(args, {value: this._selector.value.value}));
    }

    /**
     * Placeholder text
     * @type {String}
     */
    get placeholder() {
        return this._yearSelector.placeholder;
    }
    /**
     * Placeholder text
     * @type {String}
     */
    set placeholder(value) {
        this._yearSelector.placeholder = value;
    }

    /**
     * Array of periods {Number year, Array quarters}
     * @type {Array}
     */
    get values() {
        return this._values;
    }
    /**
     * Array of periods {Number year, Array quarters}
     * @type {Array}
     */
    set values(value) {
        this._values = value;
        this._showValues();
    }

    _showValues() {
        
        if(!this._values) {
            return;
        }

        const ret = [];
        const values = this._values.sort((a, b) => a > b ? 1 : -1);
        for(const date of values) {
            ret.push(date.intlFormat(false, true));
        }

        this._selector.values = ret;

    }

    /**
     * Array [year, quarter] or string year-quarter
     * @type {Array|String}
     */
    get value() {
        return this._value;
    }
    /**
     * Array [year, quarter] or string year-quarter
     * @type {Array|String}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
        if(typeof value === 'string') {
            this._value = this._value.split('-');
        } 

        this._showValues();

    }

}

