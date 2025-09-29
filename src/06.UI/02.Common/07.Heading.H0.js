/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Heading = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {number} level level of heading
     */
    constructor(name, container, level = 1) {
        super(name, container, Element.create('h' + level));
        this.AddClass('app-component-heading');
    }

    /**
     * Value string
     * @type {string}
     */
    get value() {
        return this._element?.html();
    }
    /**
     * Value string
     * @type {string}
     */
    set value(value) {
        this._element?.html(value);
    }

}