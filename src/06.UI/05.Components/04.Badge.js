/**
 * Badge component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Badge = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-badge');

    }

    /**
     * Background color of badge
     * @type {string}
     */
    get backgroundColor() {
        return this._element.style.backgroundColor;
    }

    /**
     * Background color of badge
     * @type {string}
     */
    set backgroundColor(value) {
        this._element.style.backgroundColor = value;
    }

    /**
     * Text color of badge
     * @type {string}
     */
    get textColor() {
        return this._element.style.color;
    }

    /**
     * Text color of badge
     * @type {string}
     */
    set textColor(value) {
        this._element.style.color = value;
    }

}