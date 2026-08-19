/**
 * Select box component
 * @class
 * @extends Colibri.UI.Input
 * @memberof Colibri.UI
 */
Colibri.UI.Select = class extends Colibri.UI.Input {

    /**
     * Drop down component
     * @private
     * @type {Colibri.UI.Select.Dropdown}
     */
    _dropdown = null;

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @params {Colibri.UI.Component} dropdown dropdown component
     */
    constructor(name, container, dropdown) {
        super(name, container);
        this.AddClass('app-component-select');

        this._toggleDropdownComponent = new Colibri.UI.Pane('dropdown-handler', this);
        this._toggleDropdownComponent.Show();

        this.icon.shown = false;

        this.dropdown = (dropdown && dropdown instanceof Colibri.UI.Select.Dropdown) ?
            dropdown : new Colibri.UI.Select.DefaultDropdown('dropdown', this);

        this._dropdownShadowComponent = new Colibri.UI.Pane('dropdown-shadow', this);

        this.AddHandler('Clicked', this.__thisClicked);

        this._input.addEventListener('input', (e) => {
            this.dropdown.FilterItems(this._input.value);
        });

        this.AddHandler('Cleared', this.__thisCleared);

        this._dropdownShadowComponent.AddHandler('Clicked', this.__thisDropdownShadowClicked, false, this);
        this._toggleDropdownComponent.AddHandler('Clicked', this.__thisToggleDropdownClicked, false, this);

    }

    /** 
     * @private
     * @ignore
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisClicked(event, args) {
        if (this._input === args.domEvent.target) {
            this._dropdownShadowComponent.shown = !this._dropdownShadowComponent.shown;
            this._dropdown.shown = !this._dropdown.shown;
            this.AddClass('app-component-opened');
        }
    }

    /** 
     * @private
     * @ignore
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisCleared() {
        this.dropdown.FilterItems('');
    }

    /** 
     * @private
     * @ignore
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisDropdownShadowClicked(sender, args) {
        this._dropdown.shown = !this._dropdown.shown;
        this._dropdownShadowComponent.shown = !this._dropdownShadowComponent.shown;
        this.RemoveClass('app-component-opened');
        this.GenerateSelectionText();
    }

    /** 
     * @private
     * @ignore
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisToggleDropdownClicked(sender, args) {
        if (this._dropdown.shown) {
            this.RemoveClass('app-component-opened');
            this.GenerateSelectionText();
        } else {
            this.AddClass('app-component-opened');
        }
        this._dropdown.shown = !this._dropdown.shown;
        this._dropdownShadowComponent.shown = !this._dropdownShadowComponent.shown;

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
     * Generate selection text
     * @public
     * @returns {string}
     */
    GenerateSelectionText() {
        const selected = this.dropdown.selected;
        if (!Array.isArray(selected)) {
            try { return selected.value.title; } catch(e) { return selected; }
        } else {
            let text = [];
            selected.forEach((item) => {
                try { text.push(item.value.title); } catch(e) { text.push(item); }
            });
            return text.join('; ');
        }
    }

    /**
     * Handle selection is changed
     * @public
     */
    HandleSelectionChanged() {
        this.value = this.GenerateSelectionText();
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __DropdownSelectionChanged(event, args) {
        this.HandleSelectionChanged();
        this.Dispatch('SelectionChanged', args);
    }

    /**
     * Select icon
     * @type {Element}
     */
    get icon() {
        return this.Children('icon');
    }

    /**
     * Dropdown of Select component
     * @type {Colibri.UI.Select.Dropdown}
     */
    get dropdown() {
        return this._dropdown;
    }

    /**
     * Dropdown of Select component
     * @type {Colibri.UI.Select.Dropdown}
     */
    set dropdown(value) {
        this._dropdown = value;
        this._dropdown.AddHandler('SelectionChanged', this.__DropdownSelectionChanged, false, this);
    }

}