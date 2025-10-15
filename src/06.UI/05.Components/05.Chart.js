/**
 * @class
 * @namespace
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Chart = class extends Colibri.UI.Component {

    /** Horizontal orientation */
    static OrientationHorizontal = 'horizontal';
    /** Vertical orientation */
    static OrientationVertical = 'vertical';

    /** @type {string} */
    _orientation = Colibri.UI.Split.OrientationHorizontal;

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-component-chart');
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('BarClicked', false, 'When the bar is clicked');
        this.RegisterEvent('BarDoubleClicked', false, 'When the bar is double clicked');
    }

    /**
     * Orientation of chart
     * @type {horizontal,vertical}
     */
    get orientation() {
        return this._orientation;
    }
    /**
     * Orientation of chart
     * @type {horizontal,vertical}
     */
    set orientation(value) {
        this._orientation = value;
        this.AddClass('app-component-chart-' + this._orientation);
    }

    /**
     * Adds a bar chart
     * @param {string} name name of chart
     * @returns {Colibri.UI.Chart.Barchart}
     */
    AddBarchart(name) {
        let barchart = this.Children(name);
        if(!barchart) {
            barchart = new Colibri.UI.Chart.Barchart(name, this);
            barchart.orientation = this._orientation;
        }
        return barchart
    }

    /**
     * Value Array
     * @type {Array}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Array
     * @type {Array}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
        const maxValue = Math.max(...this._value.map(v => v.value));
        const maxPercent = 100;
        
        const newNames = this._value.map(v => v?.id ?? String.MD5(v.title));
        const names = this.Children().map(c => c.name);
        const toDelete = names.filter(x => !newNames.includes(x));
        if(toDelete.length > 0) {
            this.Clear();
        }

        for(const v of this._value) {

            const percent = (v.value / maxValue) * maxPercent;

            let barchart = this.AddBarchart(v?.id ?? String.MD5(v.title));
            barchart.textValue = v.title;
            barchart.title = v?.valueTitle ?? ( v.value === 0 ? '' : v.value );
            barchart.value = percent;
            barchart.tag = v?.tag ?? v;
            barchart.toolTip = v.title + '<br />' + v.value;
        }

        console.log(this.container.children.length)
    }
}

/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Chart
 */
Colibri.UI.Chart.Barchart = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));

        this.AddClass('app-component-barchart');

        this.shown = true;

        this._title = new Colibri.UI.Component('barchart-title', this);
        this._title.AddClass('barchart-title');
        this._title.shown = true;

        this._barchart = new Colibri.UI.Component('barchart', this);
        this._barchart.AddClass('barchart-body');
        this._barchart.shown = true;

        this._textValue = new Colibri.UI.Component('barchart-text-value', this);
        this._textValue.AddClass('barchart-text-value');

        this.AddHandler('Clicked', this.__thisClicked);
    }

    Dispose() {
        this.ClearHandlers();
        super.Dispose();
    }


    __thisClicked(event, args) {
        this.parent.Dispatch('BarClicked', Object.assign(args, {bar: this}));
    }

    /**
     * Title of chart
     * @type {string}
     */
    get title() {
        return this._title;
    }

    /**
     * Title of chart
     * @type {string}
     */
    set title(value) {
        this._title.value = value;
    }

    /**
     * Chart value
     * @type {number}
     */
    set value(value) {
        return this._barchart._element.css(this._orientation === 'vertical' ? 'height' : 'width', value + '%');
    }
    
    /**
     * Force something visible
     * @type {Boolean}
     */
    get forceVisible() {
        return this._forceVisible;
    }
    /**
     * Force something visible
     * @type {Boolean}
     */
    set forceVisible(value) {
        this._forceVisible = value;
        if(value) {
            this._barchart._element.css('min-height', '0.5%');
        }
    }

    /**
     * Chart value
     * @type {number}
     */
    get value() {
        return this._barchart._element.css('width');
    }

    /**
     * Text value
     * @type {string}
     */
    get textValue() {
        return this._textValue;
    }

    /**
     * Text value
     * @type {string}
     */
    set textValue(value) {
        this._textValue.value = value;
    }

    /**
     * Orientation of bar
     * @type {String}
     */
    get orientation() {
        return this._orientation;
    }
    /**
     * Orientation of bar
     * @type {String}
     */
    set orientation(value) {
        this._orientation = value;
    }
    
}