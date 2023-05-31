Colibri.UI.Link = class extends Colibri.UI.Component {
    constructor(name, container, value) {
        super(name, container, Element.create('a'));
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
       
    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._element.attr('disabled') !== 'disabled';
    }
    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        this._element.attr('disabled', value === true || value === 'true' ? null : 'disabled');
    }

}