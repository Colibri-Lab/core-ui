/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Link = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
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

    get navigate() {
        return this._navigate;
    }
    set navigate(value) {
        this._navigate = value;
        this._element.attr('href', '#' + Date.Mc());
        this.AddHandler('Clicked', (event, args) => {
            App.Router.Navigate(this._navigate?.url ?? '/', this._navigate?.options ?? {});
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });
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

    get download() {
        return this._element.attr('download');
    }
    set download(value) {
        this._element.attr('download', value);
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