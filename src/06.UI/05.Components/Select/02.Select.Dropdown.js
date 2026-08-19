/**
 * Select box dropdown component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Select
 */
Colibri.UI.Select.Dropdown = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @params {boolean} resizable dropdown is component
     */
    constructor(name, container, resizable) {
        super(name, container, Element.create('div'), resizable);
    }

    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда меняется выбранный элемент');
    }

    /**
     * Filters an items (do nothing)
     * @param {string} term term to filter
     * @public
     */
    FilterItems(term) {
        // Do nothing
    }

    /**
     * Selected items
     * @type {Array}
     */
    get selected() {
        return [];
    }

};