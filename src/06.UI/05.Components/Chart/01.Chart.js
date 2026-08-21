/**
 * Simple chart component
 * @class
 * @namespace
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const chart = new Colibri.UI.Chart('chart', this);
 * const bar = chart.AddBarchart('barchart');
 * bar.title = 'Chart title';
 * bar.value = 50;
 * bar.textValue = '50%';
 * ``` 
 */
Colibri.UI.Chart = class extends Colibri.UI.Component {

    /** 
     * Horizontal orientation
     * @const {string}
     */
    static OrientationHorizontal = 'horizontal';
    /** 
     * Vertical orientation
     * @const {string}
     */
    static OrientationVertical = 'vertical';

    /** 
     * Orientation of the chart
     * @var {string}
     */
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
     * @ignore
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
     * @public
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

    /** 
     * @ignore
     * @private
     */
    _showValue() {
        
        const maxValue = Math.max(...this._value.map(v => v.value));
        const maxPercent = 100;
        const toolTipMethod = this._barchartToolTipMethod ?? ((v) => { return v.title + '<br />' + v.value; });

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
            barchart.toolTip = toolTipMethod(v);
            barchart.toolTipPosition = this._barchartToolTipPosition ?? 'left bottom';
        }

    }

    /**
     * Bar charts tooltip position
     * @type {left bottom,right bottom,left top,right top}
     */
    get barchartToolTipPosition() {
        return this._barchartToolTipPosition;
    }
    /**
     * Bar charts tooltip position
     * @type {left bottom,right bottom,left top,right top}
     */
    set barchartToolTipPosition(value) {
        this._barchartToolTipPosition = value;
    }

    /**
     * Bar chart tooltip method
     * @type {Function}
     */
    get barchartToolTipMethod() {
        return this._barchartToolTipMethod;
    }
    /**
     * Bar chart tooltip method
     * @type {Function}
     */
    set barchartToolTipMethod(value) {
        this._barchartToolTipMethod = value;
    }

}
