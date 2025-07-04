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
        this.AddHandler('Clicked', this.__thisClicked);
    }

    __thisClicked(event, args) {
        App.Router.Navigate(event.sender.navigate?.url ?? '/', event.sender.navigate?.options ?? {});
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
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

    /**
     * Show custom menu
     * @type {Boolean}
     */
    get customMenu() {
        return this._customMenu;
    }
    /**
     * Show custom menu
     * @type {Boolean}
     */
    set customMenu(value) {
        this._customMenu = value;
        if (value) {
            this.AddHandler('ContextMenu', this.__thisMouseDown);
            this.AddHandler('ContextMenuItemClicked', this.__thisContextMenuItemClicked);
        }
    }

    __thisMouseDown(event, args) {

        const contextmenu = [];
        contextmenu.push({ title: '#{ui-link-opennewtab}', name: 'openblank' });
        contextmenu.push({ title: '#{ui-link-open}', name: 'open' });
        this.contextmenu = contextmenu;
        this.ShowContextMenu([Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT]);
        args.domEvent.preventDefault();
        return false;
    }

    __thisContextMenuItemClicked(event, args) {
        if (args.menuData?.name === 'openblank') {
            this.Dispatch('Clicked', Object.assign(args, { target: '_blank' }));
        } else if (args.menuData?.name === 'open') {
            this.Dispatch('Clicked', args);
        }
    }

}