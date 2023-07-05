
Colibri.UI.YearQuarterSelector = class extends Colibri.UI.FlexBox {

    constructor(name, container, values = null) {
        super(name, container);
        this.AddClass('app-component-year-quarter-selector');

        this._values = values;

        this._yearSelector = new Colibri.UI.Selector(this.name + '-year', this);
        this._quarterSelector = new Colibri.UI.Selector(this.name + '-quarter', this);
        this._yearSelector.searchable = false;
        this._quarterSelector.searchable = false;

        this._quartersTexts = [
            '#{ui-yearquarter-selector-1}',
            '#{ui-yearquarter-selector-2}',
            '#{ui-yearquarter-selector-3}',
            '#{ui-yearquarter-selector-4}',
        ];
        
        this._yearSelector.shown = true;
        this._quarterSelector.shown = true;

        this._yearSelector.AddHandler('Changed', (event, args) => this.__yearSelectorChanged(event, args));
        this._quarterSelector.AddHandler('Changed', (event, args) => this.__quarterSelectorChanged(event, args));

    }
    
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Когда значение изменилось');
    }

    __yearSelectorChanged(event, args) {
        const selectedYear = this._yearSelector.value.value;
        
        const quarters = [];
        let selectedQuarter = null;
        for(const period of this._values) {
            if(period.year === selectedYear) {
                selectedQuarter = period.quarters[0];
                for(const quarter of period.quarters) {
                    quarters.push({value: quarter, title: this._quartersTexts[quarter - 1]});
                }
            }
        }

        this._quarterSelector.values = quarters;
        this._quarterSelector.value = selectedQuarter;
        this._value = {year: selectedYear, quarter: selectedQuarter};
        this.Dispatch('Changed', Object.assign(args, {value: this._value}));
    }

    __quarterSelectorChanged(event, args) {
        this._value = {year: this._yearSelector.value.value, quarter: this._quarterSelector.value.value};
        this.Dispatch('Changed', Object.assign(args, {value: this._value}));
    }

    /**
     * Quarters placeholder text
     * @type {String}
     */
    get quarterPlaceholder() {
        return this._quarterSelector.placeholder;
    }
    /**
     * Quarters placeholder text
     * @type {String}
     */
    set quarterPlaceholder(value) {
        this._quarterSelector.placeholder = value;
    }

    /**
     * Years placeholder text
     * @type {String}
     */
    get yearPlaceholder() {
        return this._yearSelector.placeholder;
    }
    /**
     * Years placeholder text
     * @type {String}
     */
    set yearPlaceholder(value) {
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

        const selectedYear = this._value?.year ?? this._values[0].year;
        const selectedQuarter = this._value?.quarter ?? this._values[0].quarters[0];
        
        const quarters = [];
        const years = [];
        for(const period of this._values) {
            years.push({value: period.year, title: period.year});
            if(period.year === selectedYear) {
                for(const quarter of period.quarters) {
                    quarters.push({value: quarter, title: this._quartersTexts[quarter - 1]});
                }
            }
        }
        this._yearSelector.values = years;
        this._quarterSelector.values = quarters;
        this._yearSelector.value = selectedYear;
        this._quarterSelector.value = selectedQuarter;

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

