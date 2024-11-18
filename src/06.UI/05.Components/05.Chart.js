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
     * Orientation of chart
     * @type {string}
     */
    get orientation() {
        return this._orientation;
    }
    /**
     * Orientation of chart
     * @type {string}
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
        let barchart = new Colibri.UI.Chart.Barchart(name, this);
        barchart.orientation = this._orientation;
        return barchart
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