Colibri.UI.List = class extends Colibri.UI.Component {

    constructor(name, container, element, multiple) {
        super(name, container, element);
        this.AddClass('app-component-list');

        this._canSelect = true;
        this.AddClass('-can-select');
        this._selected = [];

        if (multiple === undefined) {
            multiple = false;
        }
        this._multiple = multiple;

        this.tabIndex = -1;
        this._scrolling = -1;
        this._scrollY = -1;
        this._element.addEventListener('scroll', (event) => {
            try {
                if(event.target.scrollTop > this._scrollY) {
                    if (this.Children('lastChild').container.getBoundingClientRect().bottom < (event.target.getBoundingClientRect().bottom + 10)) {
                        clearTimeout(this._scrolling);
                        this._scrolling = setTimeout(() => {
                            this.Dispatch('ScrolledToBottom', {});
                        }, 66);
                    }
                }
                this._scrollY = event.target.scrollTop;    
            }
            catch(e) {

            }
        });

        this.AddHandler('ReceiveFocus', (event, args) => this.AddClass('-focused'));
        this.AddHandler('LoosedFocus', (event, args) => this.RemoveClass('-focused'));

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, изменилось выделение');
        this.RegisterEvent('ItemClicked', false, 'Поднимается, при нажатии на элемент списка');
        this.RegisterEvent('ItemMouseDown', false, 'Поднимается, при нажатии на элемент списка');
        this.RegisterEvent('ItemMouseUp', false, 'Поднимается, при нажатии на элемент списка');
        this.RegisterEvent('ItemDoubleClicked', false, 'Поднимается, при двойном нажатии на элемент списка');
        this.RegisterEvent('GroupToggled', false, 'Поднимается, когда изменяется состяние отображения группы');
        this.RegisterEvent('ScrolledToBottom', false, 'Поднимается, когда доскролили до конца');
        this.RegisterEvent('ItemEventHandled', false, 'Поднимается, какое то событие рендерера произошло');
    }

    AddGroup(name, title) {
        const group = new Colibri.UI.List.Group(name, this);
        group.label.value = title;
        group.shown = true;
        group.hasContextMenu = this.hasContextMenu;
        return group;
    }

    FindItem(searchingItemIdOrCompareMethod) {
        
        let found = null;
        this.ForEach((name, group) => {
            group.ForEach((n, item) => {

                let condition = false;
                if(searchingItemIdOrCompareMethod instanceof Function) {
                    condition = searchingItemIdOrCompareMethod(item);
                }
                else {
                   condition = searchingItemIdOrCompareMethod == n; 
                }

                if(condition) {
                    found = item;
                    return false;
                }

            });
            if(found) {
                return false;
            }
        });

        return found;
    }

    UnselectItem(selected) {
        if(!this._multiple) {
            this.ClearSelection(false);
        }
        else if(Array.isArray(selected)) {
            selected.forEach((sel) => {
                this.UnselectItem(sel);
            });
        }
        else {
            const index = this._selected.findIndex(i => i.name == selected.name);
            if(index >= 0) {
                // уже выбран, надо снять выбор
                this._selected.splice(index, 1);
                selected.selected = false;
            }
        }
    }

    /**
     * Устанавливает выбор на пункт
     * @param {Colibri.UI.List.Item} selected
     */
    SelectItem(selected) {
        if(!this._canSelect || !selected) {
            return;
        }
        if(!this._multiple) {
            this.ClearSelection(false);
            selected = Array.isArray(selected) && selected.length ? selected.shift() : selected;
            selected.selected = true;
            this._selected.push(selected);
        }
        else if(Array.isArray(selected)) {
            // если multiple то может быть массив
            selected.forEach((sel) => {
                this.SelectItem(sel);
            });
        }
        else {
            const index = this._selected.findIndex(i => i.name == selected.name);
            if(index >= 0) {
                // уже выбран, надо снять выбор
                this._selected.splice(index, 1);
                selected.selected = false;
            }
            else {
                selected.selected = true;
                this._selected.push(selected);
            }
        }
    }

    /**
     * Устанавливает выбор на пункт
     * @deprecated
     * @param {Colibri.UI.List.Item} selected
     */
    _selectItem(selected) {
        return this.SelectItem(selected);
    }

    get selectedIndex() {
        
        if(this._selected.length == 0) {
            return null;
        }

        const indices = this._selected.map(o => o.childIndex);

        return this._multiple ? indices : indices.pop();

    }
    
    set selectedIndex(value) {

        const currentSelection = JSON.stringify(this.selectedIndex);

        let index = 0;
        let selected = null;
        this.ForEach((name, group) => {
            group.ForEach((n, item) => {
                if(index == value) {
                    selected = item;
                    return false;
                }
                index ++;
                return true;
            });
            if(selected) {
                return false;
            }
            return true;
        });

        if(!selected) {
            return;
        }

        this.SelectItem(selected);

        if(JSON.stringify(this.selectedIndex) != currentSelection) {
            this.Dispatch('SelectionChanged', {selected: this.selected});
        }

    }

    /** @type {Object} */
    get selectedValue() {
        let values = [];
        this._selected.forEach((item) => {
            values.push(item.value);
        });
        return this._multiple ? values : values.pop();
    }

    set selectedValue(value) {

        const currentSelection = JSON.stringify(this.selectedIndex);

        // value обьект значения
        let selected = null;
        this.ForEach((name, group) => {
            group.ForEach((n, item) => {
                if((item.value?.id ?? item.value) == (value?.id ?? value)) {
                    selected = item;
                    return false;
                }
            });
        });

        if(!selected) {
            return;
        }

        this.SelectItem(selected);

        if(JSON.stringify(this.selectedIndex) != currentSelection) {
            this.Dispatch('SelectionChanged', {selected: this.selected});
        }

    }


    /** @type {Colibri.UI.List.Item} */
    get selected() {
        if (!this._multiple) {
            return this._selected[0];
        }
        return this._selected;
    }
    set selected(value) {
        // value - Colibri.UI.Item
        const currentSelection = JSON.stringify(this.selectedIndex);
        
        this.SelectItem(value);
        
        if(JSON.stringify(this.selectedIndex) != currentSelection) {
            this.Dispatch('SelectionChanged', {selected: this.selected});
        }
    }

    ShowSelection() {
        
        if(this._selected.length > 0) {
            this._selected[0].EnsureVisible();
        }

    }

    get multiple() {
        return this._multiple;
    }

    set multiple(value) {
        this._multiple = value;
    }

    ClearAllGroups() {
        this.ForEach((name, component) => {
            if(component instanceof Colibri.UI.List.Group) {
                component.Dispose();
            }
        })
    }

    ClearSelection(fireAnEvent = true) {
        this._selected.forEach((item) => {
            item.selected = false;
        });
        this._selected = [];
        if(fireAnEvent) {
            this.Dispatch('SelectionChanged', {selected: this.selected});
        }
    }

    _createContextMenuButton() {
        // Do nothing
    }

    _removeContextMenuButton() {
        // Do nothing
    }

    get value() {

    }

    set value(data) {

        this.ClearSelection(false);

        this.KeepInMind();

        const renderer = new Colibri.UI.List.JsonRenderer(this, data);
        renderer.Render();

        this.Retreive();

    }

    __renderBoundedValues(data) {
        try {
            this.value = data;
        }
        catch(e) {

        }
    }

    /**
     * Компонент отрисовщик
     * @type {string|Colibri.UI.Component|Function}
     */
    get rendererComponent() {
        return this._rendererComponent;
    }
    /**
     * Компонент отрисовщик
     * @type {string|Colibri.UI.Component|Function}
     */
    set rendererComponent(value) {
        this._rendererComponent = value;
    }

    /**
     * Атрибуты для передачи в компонент отрисовщик
     * @type {string|Object}
     */
    get rendererAttrs() {
        return this._rendererAttrs;
    }
    /**
     * Атрибуты для передачи в компонент отрисовщик
     * @type {string|Object}
     */
    set rendererAttrs(value) {
        if(typeof value === 'string') {
            eval('value = ' + value + ';');
        }
        this._rendererAttrs = value;
    }

    /**
     * Can select items
     * @type {boolean}
     */
    get canSelect() {
        return this._canSelect;
    }
    /**
     * Can select items
     * @type {boolean}
     */
    set canSelect(value) {
        this._canSelect = value === true || value === 'true';
        if(this._canSelect) {
            this.AddClass('-can-select');
        } else {
            this.RemoveClass('-can-select');
        }
    }

    /**
     * Has searchbox in top of list
     * @type {Boolean}
     */
    get hasSearchBox() {
        return this._searchBox !== null;
    }
    /**
     * Has searchbox in top of list
     * @type {Boolean}
     */
    set hasSearchBox(value) {
        if(value) {
            this.AddClass('-has-search');
            this._searchBox = new Colibri.UI.List.SearchBox(this.name + '-searchbox', this);
            this._searchBox.shown = true;
            this._searchBox.AddHandler('Changed', (event, args) => this.__searchBoxChanged(event, args));
        } else if(this._searchBox) {
            this.RemoveClass('-has-search');
            this._searchBox.Dispose();
            this._searchBox = null;
        }
    }

    __searchBoxChanged(event, args) {
        const f = this._searchFilterCallback;
        this.ForEach((name, component) => {
            if(component instanceof Colibri.UI.List.Group) {
                component.ForEach((n, item) => {
                    if(this._searchFilterCallback) {
                        item.shown = f(item, this._searchBox.value);
                    }
                });
            }
        });
    }

    /**
     * Has search icon in search box
     * @type {Boolean}
     */
    get searchBoxSearchIcon() {
        if(!this._searchBox) {
            return false;
        }
        return this._searchBox.hasIcon;
    }
    /**
     * Has search icon in search box
     * @type {Boolean}
     */
    set searchBoxSearchIcon(value) {
        if(!this._searchBox) {
            return;
        }
        this._searchBox.hasIcon = value;
    }
    
    /**
     * Searchbox placeholder
     * @type {String}
     */
    get searchBoxPlaceholder() {
        if(!this._searchBox) {
            return; 
        }
        return this._searchBox.placeholder;
    }
    /**
     * Searchbox placeholder
     * @type {String}
     */
    set searchBoxPlaceholder(value) {
        if(!this._searchBox) {
            return;
        }
        this._searchBox.placeholder = value;
    }

    /**
     * 
     * @type {}
     */
    get searchFilterCallback() {
        return this._searchFilterCallback;
    }
    /**
     * 
     * @type {}
     */
    set searchFilterCallback(value) {
        this._searchFilterCallback = value;
    }

    FocusOnSearchBox() {
        if(!this._searchBox) {
            return;
        }
        this._searchBox.Focus();
    }


}

Colibri.UI.List.SearchBox = class extends Colibri.UI.Pane {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-component-list-searchbox');

        this._input = new Colibri.UI.Input(this.name + '-input', this);
        this._input.shown = true;
        this._input.AddHandler(['Filled', 'Cleared'], (event, args) => this.Dispatch('Changed', args));

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Когда изменился поиск');
    }

    /**
     * 
     * @type {}
     */
    get hasIcon() {
        return this._input.hasIcon;
    }
    /**
     * 
     * @type {}
     */
    set hasIcon(value) {
        this._input.hasIcon = value;
    }

    /**
     * 
     * @type {}
     */
    get placeholder() {
        return this._input.placeholder;
    }
    /**
     * 
     * @type {}
     */
    set placeholder(value) {
        this._input.placeholder = value;
    }

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

Colibri.UI.List.Group = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container);

        this.AddClass('app-component-list-group');

        this._span = new Colibri.UI.TextSpan('span', this);
        this._div = new Colibri.UI.Pane('div', this);
        this._span.shown = true;
        this._div.shown = true;

        // this._span = this._element.append(Element.create('span', {}));
        // this._div = this._element.append(Element.create('div', {}));

        this._handlerEvents();
        
    }

    static CreateKey(itemData) {
        return itemData?.__id ?? itemData?.id ?? String.MD5(JSON.stringify(Object.sortPropertiesRecursive(itemData))); 
    }

    _handlerEvents() {

        this.AddHandler('ContextMenuIconClicked', (event, args) => this.parent.Dispatch('ContextMenuIconClicked', Object.assign({item: args.item}, args)));
        this.AddHandler('ContextMenuItemClicked', (event, args) => this.parent.Dispatch('ContextMenuItemClicked', Object.assign({item: args.item}, args)));

        this.AddHandler('Clicked', (sender, args) => {
            if (args.domEvent.target.tagName == 'SPAN' && args.domEvent.target.parentElement == this._element) {
                this.expanded = !this.expanded;
            }
        });
    }

    ForEach(handler) {
        this._div.ForEach(handler);
    }

    Items(name = null) {
        return this._div.Children(name);
    }

    AddItem(itemData, id = null, selected = false, index = null) {

        const newKey = Colibri.UI.List.Group.CreateKey(itemData); 
        const foundItem = this.FindByKey(newKey);

        let control;
        if(foundItem !== -1) {
            control = this._div.Children(foundItem);
            control.value = itemData;
            if(index) {
                this._div.Children(control.name, control, index);
            }
        } else {
            const name = (id || itemData?.id || '_' + Number.unique());
            control = new Colibri.UI.List.Item('item-' + name, this._div);
            control.shown = true;
            control.selected = selected;
            control.hasContextMenu = this.hasContextMenu;
            control.key = newKey;
            control.value = itemData;

            if(this.parent?.tag && this.parent?.tag?.params && this.parent?.tag?.params?.sort) {
                const foundIndex = this.parent.tag.params.sort(control, this);
                this._div.Children(name, control, foundIndex);
            }

        }

        if(selected) {
            this.parent.SelectItem(control);
        }

        return control;

    }

    FindByKey(key) {
        return this._div.indexOf((item) => {
            const itemKey = Colibri.UI.List.Group.CreateKey(item.value); 
            return itemKey === key;
        });
    }

    get children() {
        return this._div.children;
    }

    get label() {
        return this._span;
    }

    set label(value) {
        this._span.value = value;
    }

    get expandable() {
        return this.ContainsClass('app-component-expandable');
    }

    set expandable(value) {
        if (value) {
            this.AddClass('app-component-expandable');
        } else {
            this.RemoveClass('app-component-expandable');
        }
    }

    get expanded() {
        return !this.ContainsClass('app-component-collapsed')
    }

    set expanded(value) {
        if (this.ContainsClass('app-component-collapsed')) {
            this.Expand();
        } else {
            this.Collapse();
        }
    }

    get value() {
        return this._div.Map((name, item, index) => item.value);
    }

    set value(value) {

        this.parent.ClearSelection(false);
        if(!(Symbol.iterator in Object(value))) {
            return;
        }

        this.KeepInMind();

        const oldKeys = [];
        const oldValues = this.value;
        for(const item of oldValues) {
            const key = Colibri.UI.List.Group.CreateKey(item);
            oldKeys.push(key);
        }

        const newKeys = [];
        let index = 0;
        for(const item of value) {
            newKeys.push(Colibri.UI.List.Group.CreateKey(item));
            this.AddItem(item, null, item?.__selected, index++);
        }

        for(const key of oldKeys) {
            if(newKeys.indexOf(key) === -1) {
                const foundIndex = this.FindByKey(key);
                if(foundIndex !== -1) {
                    const item = this._div.Children(foundIndex);
                    item.Dispose();
                }
            }
        }

        this.Retreive();

    }

    /**
     * Sets and empty message
     * @type {String}
     */
    get emptyMessage() {
        return this._div.container.data('empty');
    }
    /**
     * Sets and empty message
     * @type {String}
     */
    set emptyMessage(value) {
        this._div.container.data('empty', value);
    }

    
    /**
     * @deprecated
     */
    set noItemsText(value) {
        this.emptyMessage = value;
    }
    
    /**
     * @deprecated
     */
    get noItemsText() {
        return this.emptyMessage;
    }

    Expand() {
        if (this.expandable) {
            this.RemoveClass('app-component-collapsed');
            if (this.parent instanceof Colibri.UI.List) {
                this.parent.Dispatch('GroupToggled', {state: 'expanded'});
            }
        }
    }

    Collapse() {
        if (this.expandable) {
            this.AddClass('app-component-collapsed');
            if (this.parent instanceof Colibri.UI.List) {
                this.parent.Dispatch('GroupToggled', {state: 'collapsed'});
            }
        }
    }

    _createContextMenuButton() {
        // Do nothing
    }

    _removeContextMenuButton() {
        // Do nothing
    }

    get contextmenu() {
        return this.parent.contextmenu;
    }

    set contextmenu(items) {
        this.parent.contextmenu = items;
    }


    Clear() {
        this._div.Clear();
    }

    /**
     * @deprecated
     */
    set items(value) {
        this.value = value;
    }
    /**
     * @deprecated
     */
    get items() {
        return this.value;
    }

}

Colibri.UI.List.Item = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container);

        this.AddClass('app-component-list-item');

        this.AddHandler('Clicked', this.__ItemSelected);
        this.AddHandler('DoubleClicked', this.__ItemDblSelected);
        this.AddHandler('MouseDown', this.__ItemMouseDown);
        this.AddHandler('MouseUp', (event, args) => this.list?.Dispatch('ItemMouseUp', args));

        this.AddHandler('ContextMenuIconClicked', (event, args) => this.group.Dispatch('ContextMenuIconClicked', Object.assign({item: this}, args)));
        this.AddHandler('ContextMenuItemClicked', (event, args) => this.group.Dispatch('ContextMenuItemClicked', Object.assign({item: this}, args)));

    }


    /** @type {boolean} */
    get selected() {
        return this._element.is('.app-component-selected');
    }

    set selected(value) {
        if (value) {
            this.AddClass('app-component-selected');
            // this._element.ensureInViewport(this.list?.container ?? document.body);
        } else {
            this.RemoveClass('app-component-selected');
        }
    }

    __ItemSelected(event, args) {
        this.list.Dispatch('ItemClicked', Object.assign(args, {item: this, domEvent: args.domEvent}));
    }

    __ItemDblSelected(event, args) {
        this.list.Dispatch('ItemDoubleClicked', {item: this, domEvent: args.domEvent});
    }

    __ItemMouseDown(event, args) {
        if(this.list) {
            this.list.selected = this;
            this.list?.Dispatch('ItemMouseDown', {item: this, domEvent: args.domEvent});
        }
    }

    /** @type {object} */
    get value() {
        return this._itemData;
    }

    set value(value) {

        const oldKey = String.MD5(JSON.stringify(Object.sortPropertiesRecursive(this._itemData)));
        const newKey = String.MD5(JSON.stringify(Object.sortPropertiesRecursive(value)));
        if(oldKey === newKey) {
            return;
        }

        this._itemData = value;
        
        let html = this._itemData?.title ?? '';
        if(this.list?.rendererComponent) {
            const attrs = this.list?.rendererAttrs ?? {};
            let content = this.Children(this._itemData?.name ?? this.name + '_renderer');
            if(!content) {
                let comp = typeof(this.list.rendererComponent) === 'string' ? this.list.rendererComponent : this.list.rendererComponent(this._itemData, this);
                if(!(comp instanceof Colibri.UI.Component)) {
                    comp = eval(comp);
                }
                content = new comp(this._itemData?.name ?? this.name + '_renderer', this);
                content.shown = true;
                delete attrs.name;
                Object.forEach(attrs, (key, value) => {
                    content[key] = value;
                });
            }
            if(attrs?.render) {
                content[attrs?.render] = this._itemData;
            } else {
                content.value = this._itemData;
            }
            html = null;
        } else if(this.list?.__renderItemContent) {
            html = this.list.__renderItemContent(this._itemData, this);
        }
        else if(this._itemData?.__render) {
            html = this._itemData.__render.apply(this, [this._itemData, this]);
        }
        
        if(html) {
            this._element.html(html);
        }

        let data = Object.assign({}, this._itemData);
        delete data.__render;

        this._element.tag(data);
    }

    get contextmenu() {
        return this.group.contextmenu;
    }

    set contextmenu(items) {
        this.group.contextmenu = items;
    }

    /**
     * Key value
     * @type {string}
     */
    get key() {
        return this._key;
    }
    /**
     * Key value
     * @type {string}
     */
    set key(value) {
        this._key = value;
    }

    get list() {
        return this.group?.parent ?? null;
    }

    get group() {
        return this.parent?.parent ?? null;
    }

}
