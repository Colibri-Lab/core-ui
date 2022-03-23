Colibri.UI.Icon = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<span />');
        this.AddClass('app-component-icon');
    }

    get icon() {
        return this._element.style.backgroundImage;
    }

    set icon(value) {
        this._element.css('background-image', value);
    }

    set iconSVG(value) {
        this.html = eval(value);
    }
}