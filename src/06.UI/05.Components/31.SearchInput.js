/**
 * Search input component
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI
 */
Colibri.UI.SearchInput = class extends Colibri.UI.FlexBox {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.SearchInput']);
        this.AddClass('colibri-ui-searchinput');

        this._input = this.Children('input');
        this._search = this.Children('search');

        this._input.AddHandler(['KeyDown','Pasted'], (event, args) => this.__inputSearch(event, args));
        this._search.AddHandler('Clicked', (event, args) => this.Dispatch('Search', {value: this.value}));

    }

    __inputSearch(event, args) {
        if( (event.name === 'KeyDown' && args.domEvent.keyCode === 13) || event.name === 'Pasted' ) {
            this.Dispatch('Search', {value: this.value});
        }
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Search', false, 'When search is completed');
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

    /**
     * Input placeholder
     * @type {String}
     */
    get placeholder() {
        return this._input.placeholder;
    }
    /**
     * Input placeholder
     * @type {String}
     */
    set placeholder(value) {
        this._input.placeholder = value;
    }


    /**
     * Search icon 
     * @type {String}
     */
    get searchIcon() {
        return this._search.iconSVG;
    }
    /**
     * Search icon 
     * @type {String}
     */
    set searchIcon(value) {
        this._search.iconSVG = value;
    }

}