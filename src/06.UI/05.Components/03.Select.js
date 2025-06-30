/**
 * Component select box
 * @class
 * @namespace
 * @extends Colibri.UI.Input
 * @memberof Colibri.UI
 */
Colibri.UI.Select = class extends Colibri.UI.Input {

    /** @type {Colibri.UI.Select.Dropdown} */
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

    __thisClicked(event, args) {
        if (this._input === args.domEvent.target) {
            this._dropdownShadowComponent.shown = !this._dropdownShadowComponent.shown;
            this._dropdown.shown = !this._dropdown.shown;
            this.AddClass('app-component-opened');
        }
    }

    __thisCleared() {
        this.dropdown.FilterItems('');
    }

    __thisDropdownShadowClicked(sender, args) {
        this._dropdown.shown = !this._dropdown.shown;
        this._dropdownShadowComponent.shown = !this._dropdownShadowComponent.shown;
        this.RemoveClass('app-component-opened');
        this.GenerateSelectionText();
    }

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

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('OptionClicked', false, 'Поднимается, когда кликаем по опции');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда кликаем по элементу списка');
    }

    /**
     * Generate selection text
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
     */
    HandleSelectionChanged() {
        this.value = this.GenerateSelectionText();
    }

    /**
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
     * @readonly
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

};

/**
 * Component select box dropdown
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

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда меняется выбранный элемент');
    }

    /**
     * Filters an items (do nothing)
     * @param {string} term term to filter
     */
    FilterItems(term) {
        // Do nothing
    }

    /**
     * Selected items
     * @type {Array}
     * @readonly
     */
    get selected() {
        return [];
    }

};

/**
 * Default dropdown component
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

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('OptionClicked', false, 'Поднимается, когда кликаем по опции');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда кликаем по элементу списка');
    }

    /**
     * Filters item array
     * @param {string} searchText filter term
     */
    FilterItems(searchText) {
        this._emptySearchResult.shown = this._recursiveForEach(this.list, searchText) === 0;
    }

    /** @private */
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

    /** @protected */
    _handleEvents() {
        this.list.AddHandler('SelectionChanged', this.__thisBubble, false, this);
        this.options.AddHandler('OptionClicked', this.__thisBubble, false, this);
    }

    /**
     * List container
     * @type {Colibri.UI.List}
     * @readonly
     */
    get list() {
        return this.Children('default-dropdown-list');
    }

    /**
     * Options container
     * @type {Colibri.UI.Select.DefaultDropdown.Options}
     * @readonly
     */
    get options() {
        return this.Children('default-dropdown-options');
    }

    /**
     * Selected item
     * @type {Colibri.UI.ListItem}
     * @readonly
     */
    get selected() {
        return this.list.selected;
    }

};

/**
 * Default dropdown options component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Select.DefaultDropdown
 */
Colibri.UI.Select.DefaultDropdown.Options = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this._handleEvents();
    }

    /** @protected */
    _handleEvents() {
        this.AddHandler('Clicked', this.__thisClicked);
    }

    __thisClicked(event, args) {
        if(args.domEvent.target.is('[data-option-name]')) {
            this.Dispatch('OptionClicked', {option: args.domEvent.target.dataset.optionName});
        }
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('OptionClicked', false, 'Поднимается, когда кликаем по опции');
    }

    /**
     * Adds and option
     * @param {string} name name of option
     * @param {string} title title of option
     * @returns {Element}
     */
    AddOption(name, title) {
        this.shown = true;
        const newOption = Element.create("a", {
            href: '#'
        }, {
            'optionName': name,
            'optionTitle': title
        });
        newOption.html(title);
        this._element.append(newOption);
        return newOption;
    }

    /**
     * Removes an option
     * @param {string} name name of option
     */
    RemoveOption(name) {
        this._element.querySelector('[data-option-name="' + name + '"]').remove();
        if(this._element.querySelectorAll('[data-option-name]').length === 0) {
            this.shown = false;
        }
    }

};


