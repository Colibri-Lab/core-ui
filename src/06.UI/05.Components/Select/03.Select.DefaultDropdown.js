/**
 * Default dropdown component for select box
 * @class
 * @namespace
 * @extends Colibri.UI.Select.Dropdown
 * @memberof Colibri.UI.Select
 */
Colibri.UI.Select.DefaultDropdown = class extends Colibri.UI.Select.Dropdown {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @params {boolean} resizable dropdown is component
     * @params {boolean} multiple is component multiple selection 
     */
    constructor(name, container, resizable, multiple) {
        super(name, container, resizable);

        new Colibri.UI.List('default-dropdown-list', this, multiple);
        new Colibri.UI.Select.DefaultDropdown.Options('default-dropdown-options', this, false);

        this.list.shown = true;
        this.options.shown = false;

        this._emptySearchResult = this.list.AddGroup('emptySearchResult', '#{ui-select-emptyresult}');
        this._emptySearchResult.shown = false;

        this._handleEvents();
    }

    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('OptionClicked', false, 'Поднимается, когда кликаем по опции');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда кликаем по элементу списка');
    }

    /**
     * Filters item array
     * @param {string} searchText filter term
     * @public
     */
    FilterItems(searchText) {
        this._emptySearchResult.shown = this._recursiveForEach(this.list, searchText) === 0;
    }

    /** 
     * @ignore
     * @private
     */
    _recursiveForEach(component, searchText) {
        let totalCountValidItem = 0;
        component.ForEach((name, obj) => {
            if (obj.children > 0) {
                this._countValidItemInGroup = 0;
                totalCountValidItem += this._recursiveForEach(obj, searchText);
                obj.shown = this._countValidItemInGroup !== 0;
            } else if (obj.name !== 'emptySearchResult') {
                if (obj.name.includes(searchText) || obj.value.title.includes(searchText)) {
                    totalCountValidItem++;
                    this._countValidItemInGroup++;
                    obj.shown = true;
                } else {
                    obj.shown = false;
                }
            }
        });
        return totalCountValidItem;
    }

    /** 
     * @ignore
     * @protected
     */
    _handleEvents() {
        this.list.AddHandler('SelectionChanged', this.__thisBubble, false, this);
        this.options.AddHandler('OptionClicked', this.__thisBubble, false, this);
    }

    /**
     * List container
     * @type {Colibri.UI.List}
     */
    get list() {
        return this.Children('default-dropdown-list');
    }

    /**
     * Options container
     * @type {Colibri.UI.Select.DefaultDropdown.Options}
     */
    get options() {
        return this.Children('default-dropdown-options');
    }

    /**
     * Selected item
     * @type {Colibri.UI.ListItem}
     */
    get selected() {
        return this.list.selected;
    }

}