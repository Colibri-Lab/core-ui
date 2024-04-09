/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.SimplePieChart = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.SimplePieChart']);
        this.AddClass('colibri-ui-simplepiechart');

        this._svg = this.container.querySelector('svg');
        
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
        this._element.css('--p', this._value);
    }

}