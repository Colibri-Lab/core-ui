Colibri.UI.Chart = class extends Colibri.UI.Component {

    static OrientationHorizontal = 'horizontal';
    static OrientationVertical = 'vertical';

    _orientation = Colibri.UI.Split.OrientationHorizontal;

    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-component-chart');
    }

    get orientation() {
        return this._orientation;
    }
    set orientation(value) {
        this._orientation = value;
        this.AddClass('app-component-chart-' + this._orientation);
    }

    AddBarchart(name) {
        let barchart = new Colibri.UI.Chart.Barchart(name, this);
        barchart._orientation = this._orientation;
        return barchart
    }
}

Colibri.UI.Chart.Barchart = class extends Colibri.UI.Component {
    constructor(name, container) {
        super(name, container, Element.create('div'));

        this.AddClass('app-component-barchart');

        this.shown = true;

        this._title = new Colibri.UI.Component('barchart-title', this);
        this._title.AddClass('barchart-title');
        this._title.shown = true;

        this._barchart = new Colibri.UI.Component('barchart', this);
        this._barchart.AddClass('barchart-body');
        this._barchart._element.css('width', '50%');
        this._barchart.shown = true;

        this._textValue = new Colibri.UI.Component('barchart-text-value', this);
        this._textValue.AddClass('barchart-text-value');
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title.value = value;
    }

    set value(value) {
        return this._barchart._element.css('width', value + '%');
    }

    get value() {
        return this._barchart._element.css('width');
    }

    get textValue() {
        return this._textValue;
    }

    set textValue(value) {
        this._textValue.value = value;
    }
}