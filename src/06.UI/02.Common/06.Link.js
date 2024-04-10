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

    /**
     * Href string
     * @type {string}
     */
    get href() {
        return this._element.attr('href');
    }
    /**
     * Href string
     * @type {string}
     */
    set href(value) {
        this._element.attr('href', value);
    }

    /**
     * Navigate to
     * @type {{url,options}}
     */
    get navigate() {
        return this._navigate;
    }
    /**
     * Navigate to
     * @type {{url,options}}
     */
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

    /**
     * Value string
     * @type {string}
     */
    get value() {
        return this._element.html();
    }
    /**
     * Value string
     * @type {string}
     */
    set value(value) {
        this._element.html(value);
    }

    /**
     * Target value
     * @type {_blank,_self,_top}
     */
    get target() {
        return this._element.attr('target');
    }
    /**
     * Target value
     * @type {_blank,_self,_top}
     */
    set target(value) {
        this._element.attr('target', value);
    }

    /**
     * Download attribute
     * @type {string}
     */
    get download() {
        return this._element.attr('download');
    }
    /**
     * Download attribute
     * @type {string}
     */
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