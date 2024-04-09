/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Img = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.create('img'));
        this.AddClass('app-component-img');
    }

    get source() {
        return this._element.attr('src');
    }

    set source(value) {
        this._element.attr('src', value);

    }

    /**
     * @type {String}
     */
    get alt() {
        return this._element.attr('alt');
    }
    /**
     * @type {String}
     */
    set alt(value) {
        this._element.attr('alt', value);
   }

}