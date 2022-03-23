Colibri.UI.Link = class extends Colibri.UI.Component {
    constructor(name, container, value) {
        super(name, container, '<a />');
        this.AddClass('app-component-link');
        this.value = value;
    }

    get href() {
        return this._element.attr('href');
    }
    set href(value) {
        this._element.attr('href', value);
    }

    get value() {
        return this._element.html();
    }
    set value(value) {
        this._element.html(value);
    }

    get target() {
        return this._element.attr('target');
    }
    set target(value) {
        this._element.attr('target', value);
    }
       

}