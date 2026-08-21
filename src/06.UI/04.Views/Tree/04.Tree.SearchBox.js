/**
 * Searchbox for tree component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Tree
 */
Colibri.UI.Tree.SearchBox = class extends Colibri.UI.Pane {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-component-tree-searchbox');

        this._input = new Colibri.UI.Input(this.name + '-input', this);
        this._input.shown = true;
        this._input.AddHandler(['Filled', 'Cleared'], this.__inputChangedOrFilled, false, this);
        this._input.AddHandler('KeyDown', this.__inputKeyDown, false, this);

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __inputKeyDown(event, args) {
        args.domEvent.stopPropagation();
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __inputChangedOrFilled(event, args) {
        this.Dispatch('Changed', args);
    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When search term is changed');
    }

    /**
     * Searchbox has icon
     * @type {boolean}
     */
    get hasIcon() {
        return this._input.hasIcon;
    }
    /**
     * Searchbox has icon
     * @type {boolean}
     */
    set hasIcon(value) {
        this._input.hasIcon = value;
    }

    /**
     * Searchbox placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.placeholder;
    }
    /**
     * Searchbox placeholder
     * @type {string}
     */
    set placeholder(value) {
        this._input.placeholder = value;
    }

    /**
     * Set the focus on searchbox
     * @public
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Value of searchbox
     * @type {String}
     */
    get value() {
        return this._input.value;
    }
    /**
     * Value of searchbox
     * @type {String}
     */
    set value(value) {
        this._input.value = value;
    }

}