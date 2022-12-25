/**
 *
 * Класс выпадашка
 *
 * @example
 *
 * ! Создание компонента
 * const select = new Colibri.UI.Select('select', document.body);
 *
 * ! деалем компонент с мультивыбором
 * select.dropdown.list.multiple = true;
 *
 * ! если хотим нарисовать содержание элемента сами (пункта в списке)
 * const renderItem = (data) => data.id + ' - ' + data.title;
 *
 * ! создаем группу - группа обязательно должна быть
 * const group1 = select.dropdown.list.AddGroup('group1', 'title_group');
 *
 * ! добавляем
 * group1.AddItem({ title: '...', id: '', __render: renderItem});
 *
 * ! создаем опции внизу, под списком
 * const option1 = select.dropdown.options.AddOption('reference', 'Справочник');
 * const option2 = select.dropdown.options.AddOption('reference2', 'Справочник');
 *
 * ! получаем событие изменение списка
 * select.AddHandler('SelectionChanged', (event, args) => { наш код, args.selected - выбранное });
 *
 * ! получаем инфу, если клинкнули на опцию
 * select.dropdown.AddHandler('OptionClicked', (event, args) => { наш код, args.option - название опции  });
 *
 * ! если хотим свой дропдаун
 * const select = new Colibri.UI.Select('select', document.body, dropdownComponent);
 * ! dropdownComponent - компонент, наследованный от Colibri.UI.Select.Dropdown,
 * ! должен переопределять свойство selected
 * ! должен поднимать событие SelectionChanged - this.Dispatch('SelectionChanged', args);
 *
 */

/**
 * Komponent выпадашка
 * @type {Colibri.UI.Select}
 */
Colibri.UI.Select = class extends Colibri.UI.Input {

    _dropdown = null;

    constructor(name, container, dropdown) {
        super(name, container);
        this.AddClass('app-component-select');

        this._toggleDropdownComponent = new Colibri.UI.Pane('dropdown-handler', this);
        this._toggleDropdownComponent.Show();

        this.icon.shown = false;

        this.dropdown = (dropdown && dropdown instanceof Colibri.UI.Select.Dropdown) ?
            dropdown : new Colibri.UI.Select.DefaultDropdown('dropdown', this);

        this._dropdownShadowComponent = new Colibri.UI.Pane('dropdown-shadow', this);

        this.AddHandler('Clicked', (event, args) => {
            if (this._input === args.domEvent.target) {
                this._dropdownShadowComponent.shown = !this._dropdownShadowComponent.shown;
                this._dropdown.shown = !this._dropdown.shown;
                this.AddClass('app-component-opened');
            }
        });

        this._input.addEventListener('input', (e) => {
            this.dropdown.FilterItems(this._input.value);
        });

        this.AddHandler('Cleared', () => {
            this.dropdown.FilterItems('');
        });

        this._dropdownShadowComponent.AddHandler('Clicked', (sender, args) => {
            this._dropdown.shown = !this._dropdown.shown;
            this._dropdownShadowComponent.shown = !this._dropdownShadowComponent.shown;
            this.RemoveClass('app-component-opened');
            this.GenerateSelectionText();
        });

        this._toggleDropdownComponent.AddHandler('Clicked', (sender, args) => {
            if (this._dropdown.shown) {
                this.RemoveClass('app-component-opened');
                this.GenerateSelectionText();
            } else {
                this.AddClass('app-component-opened');
            }
            this._dropdown.shown = !this._dropdown.shown;
            this._dropdownShadowComponent.shown = !this._dropdownShadowComponent.shown;

        });

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('OptionClicked', false, 'Поднимается, когда кликаем по опции');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда кликаем по элементу списка');
    }

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

    HandleSelectionChanged() {
        this.value = this.GenerateSelectionText();
    }

    __DropdownSelectionChanged(event, args) {
        this.HandleSelectionChanged();
        this.Dispatch('SelectionChanged', args);
    }

    get icon() {
        return this.Children('icon');
    }

    get dropdown() {
        return this._dropdown;
    }

    set dropdown(value) {
        this._dropdown = value;
        this._dropdown.AddHandler('SelectionChanged', (event, args) => this.__DropdownSelectionChanged(event, args));
    }

};

/**
 * Компонент выпадашка выпадашки
 * @type {Colibri.UI.Select.Dropdown}
 */
Colibri.UI.Select.Dropdown = class extends Colibri.UI.Pane {

    constructor(name, container, resizable) {
        super(name, container, '<div />', resizable);
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда меняется выбранный элемент');
    }

    FilterItems(term) {
        // Do nothing
    }

    get selected() {
        return [];
    }

};

/**
 * Компонент выпадашка по умолчанию
 * @type {Colibri.UI.Select.DefaultDropdown}
 */
Colibri.UI.Select.DefaultDropdown = class extends Colibri.UI.Select.Dropdown {

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

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('OptionClicked', false, 'Поднимается, когда кликаем по опции');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда кликаем по элементу списка');
    }

    FilterItems(searchText) {
        this._emptySearchResult.shown = this._recursiveForEach(this.list, searchText) === 0;
    }

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

    _handleEvents() {
        this.list.AddHandler('SelectionChanged', (event, args) => { return this.Dispatch('SelectionChanged', args) });
        this.options.AddHandler('OptionClicked', (event, args) => { return this.Dispatch('OptionClicked', args) });
    }

    get list() {
        return this.Children('default-dropdown-list');
    }

    get options() {
        return this.Children('default-dropdown-options');
    }

    get selected() {
        return this.list.selected;
    }

};

/**
 * Компонент опции в выпадашке по умолчанию
 * @type {Colibri.UI.Select.DefaultDropdown.Options}
 */
Colibri.UI.Select.DefaultDropdown.Options = class extends Colibri.UI.Pane {

    constructor(name, container) {
        super(name, container);
        this._handleEvents();
    }

    _handleEvents() {
        this.AddHandler('Clicked', (event, args) => {
            if(args.domEvent.target.is('[data-option-name]')) {
                this.Dispatch('OptionClicked', {option: args.domEvent.target.dataset.optionName});
            }
        });
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('OptionClicked', false, 'Поднимается, когда кликаем по опции');
    }

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

    RemoveOption(name) {
        this._element.querySelector('[data-option-name="' + name + '"]').remove();
        if(this._element.querySelectorAll('[data-option-name]').length === 0) {
            this.shown = false;
        }
    }

};


