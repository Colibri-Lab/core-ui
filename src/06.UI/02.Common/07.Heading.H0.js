Colibri.UI.Heading = class extends Colibri.UI.Component {
    constructor(name, container, level = 1) {
        super(name, container, '<h' + level + ' />');
        this.AddClass('app-component-heading');
    }

    get value() {
        return this._element.html();
    }
    set value(value) {
        this._element.html(value);
    }

}