/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Heading = class extends Colibri.UI.Component {
    constructor(name, container, level = 1) {
        super(name, container, Element.create('h' + level));
        this.AddClass('app-component-heading');
    }

    get value() {
        return this._element.html();
    }
    set value(value) {
        this._element.html(value);
    }

}