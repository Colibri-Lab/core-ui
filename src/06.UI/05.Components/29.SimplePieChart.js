Colibri.UI.SimplePieChart = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.SimplePieChart']);
        this.AddClass('colibri-ui-simplepiechart');

        this._svg = this.container.querySelector('svg');
        this._circle = this._svg.querySelector('circle');
    }

    /**
     * Percent of pie
     * @type {Number}
     */
    get value() {
        return this._value;
    }
    /**
     * Percent of pie
     * @type {Number}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
        const bounds = this.container.bounds();

        this._svg.attr('width', bounds.outerWidth + 'px');
        this._svg.attr('height', bounds.outerWidth + 'px');
        this._circle.attr('r', bounds.outerWidth + 'px');
        this._circle.attr('cx', bounds.outerWidth + 'px');
        this._circle.attr('cy', bounds.outerWidth + 'px');
        this._circle.attr('stroke-width', (bounds.outerWidth * 2) + 'px');
        this._circle.attr('stroke-dasharray', this._value + ' 100');
    
    }

}