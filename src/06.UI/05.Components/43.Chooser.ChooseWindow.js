/**
 * Chooser choose window component
 * @class
 * @extends Colibri.UI.Window
 * @memberof Colibri.UI.Chooser
 */
Colibri.UI.Chooser.ChooseWindow = class extends Colibri.UI.Window {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|string|Colibri.UI.Component} container component container 
     * @param {Element|string} element child elements 
     * @param {string} title title of window
     * @param {number} width window width
     * @param {number} height window height
     */
    constructor(name, container, element, params, values, titleField, valueField, selectedValue) {
        super(name, container, element, 'Choose', 800, 600);
        this._params = params;
        this._values = values;
        this._value = selectedValue;
        this._valueField = valueField;
        this._titleValue = titleField;
    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        this.RegisterEvent('Choosed', false, 'When the choice is made');
    }

    /**
     * Params
     * @type {object}
     */
    get params() {
        return this._params;
    }
    /**
     * Params
     * @type {object}
     */
    set params(value) {
        this._params = value;
    }

}

