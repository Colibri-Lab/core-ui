/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TextSpan = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {string} value value of textspan
     */
    constructor(name, container, value) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-textspan');
        this.value = value;
    }

    get value() {
        return this._element.html();
    }
    set value(value) {
        this._element.html(value);
    }

}