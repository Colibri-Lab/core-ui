Colibri.UI.Badge = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-badge');

    }

    get backgroundColor() {
        return this._element.style.backgroundColor;
    }

    set backgroundColor(value) {
        this._element.style.backgroundColor = value;
    }

    get textColor() {
        return this._element.style.color;
    }

    set textColor(value) {
        this._element.style.color = value;
    }

}