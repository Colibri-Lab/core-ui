Colibri.UI.TextSpan = class extends Colibri.UI.Component {
    constructor(name, container, value) {
        super(name, container, '<span />');
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