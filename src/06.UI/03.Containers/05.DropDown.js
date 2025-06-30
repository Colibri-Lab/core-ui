/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.DropDown = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-dropdown-component');

        this.handleClickedOut = true;

        this._search = new Colibri.UI.Input('search', this);
        this._list = new Colibri.UI.List('list', this);
        this._list.__renderItemContent = this.__renderItemContent;

        this._search.placeholder = "Поиск по списку компаний";
        this._search.loading = false;
        this._search.iconSVG = Colibri.UI.SearchIcon;

        this._list.shown = true;
        this._search.shown = true;

        this._list.AddHandler('ItemClicked', this.__listItemClicked, false, this);
        this.AddHandler('Shown', this.__thisShown);
        this.AddHandler('ClickedOut', this.__thisClickedOut);

    }

    __listItemClicked(event, args) {
        this.Dispatch('ItemClicked', {item: args.item, domEvent: args.domEvent});
    }
    
    __thisClickedOut(event, args) {
        this.Hide();
    }

    __thisShown(event, args) {
        this._search.Focus();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ItemClicked', false, 'Выбран пунт меню');
    }

    /**
     * Show search box
     * @type {boolean}
     */
    set search(value) {
        this._search.shown = value;
    }
    /**
     * Show search box
     * @type {boolean}
     */
    get search() {
        return this._search.shown;
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    get shown () {
        return super.shown;
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    set shown(value) {
        super.shown = value;
        if(value) {
            this.BringToFront();
        }
        else {
            this.SendToBack();
        }
    }


}