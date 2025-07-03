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

    /**
     * Value string
     * @type {string}
     */
    get value() {
        return this._element?.html() ?? '';
    }
    /**
     * Value string
     * @type {string}
     */
    set value(value) {
        this._element?.html(value);
    }

}