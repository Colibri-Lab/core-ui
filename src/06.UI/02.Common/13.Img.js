/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Img = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('img'));
        this.AddClass('app-component-img');
    }

    /**
     * Source string
     * @type {string}
     */
    get source() {
        return this._element.attr('src');
    }

    /**
     * Source string
     * @type {string}
     */
    set source(value) {
        this._element.attr('src', value);

    }

    /**
     * Alternate text
     * @type {String}
     */
    get alt() {
        return this._element.attr('alt');
    }
    /**
     * Alternate text
     * @type {String}
     */
    set alt(value) {
        this._element.attr('alt', value);
   }

}