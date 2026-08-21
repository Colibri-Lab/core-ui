/**
 * Bar chart component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Chart
 * @example
 * ```
 * const chart = new Colibri.UI.Chart('chart', this);
 * const bar = chart.AddBarchart('barchart');
 * bar.title = 'Chart title';
 * bar.value = 50;
 * bar.textValue = '50%';
 * ```
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

    /**
     * Dispose component
     * @public
     */
    Dispose() {
        this.ClearHandlers();
        super.Dispose();
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
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