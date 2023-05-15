Colibri.UI.List = class extends Colibri.UI.Component {

    constructor(name, container, element, multiple) {
        super(name, container, element);
        this.AddClass('app-component-list');

        this._selected = [];

        if (multiple === undefined) {
            multiple = false;
        }
        this._multiple = multiple;

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
        group.value = title;
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
                if((item.value['id'] ?? item.value) == (value['id'] ?? value)) {
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

    get multiple() {
        return this._multiple;
    }

    set multiple(value) {
        this._multiple = value;
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
        const renderer = new Colibri.UI.List.JsonRenderer(this, data);
        renderer.Render();
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
     * @type {string|Colibri.UI.Component}
     */
    get rendererComponent() {
        return this._rendererComponent;
    }
    /**
     * Компонент отрисовщик
     * @type {string|Colibri.UI.Component}
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

}

Colibri.UI.List.Group = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container);

        this.AddClass('app-component-list-group');
        this._span = this._element.append(Element.create('span', {}));
        this._div = this._element.append(Element.create('div', {}));

        this._handlerEvents();
        
    }

    static CreateKey(itemData) {
        return itemData.id ?? String.MD5(JSON.stringify(Object.sortPropertiesRecursive(itemData))); 
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

    AddItem(itemData, id = null, selected = false, index = null) {

        const newKey = Colibri.UI.List.Group.CreateKey(itemData); 
        const foundItem = this.FindByKey(newKey);

        let control;
        if(foundItem !== -1) {
            control = this.Children(foundItem);
            control.value = itemData;
            if(index) {
                this.Children(control.name, control, index);
            }
        } else {
            const name = (id || itemData.id || '_' + Number.unique());
            control = new Colibri.UI.List.Item('item-' + name, this);
            control.shown = true;
            control.selected = selected;
            control.hasContextMenu = this.hasContextMenu;
            control.key = newKey;
            control.value = itemData;

            if(this.parent.tag && this.parent.tag.params && this.parent.tag.params.sort) {
                const foundIndex = this.parent.tag.params.sort(control, this);
                this.Children(name, control, foundIndex);
            }

        }

        if(selected) {
            this.parent.SelectItem(control);
        }

        return control;

    }

    FindByKey(key) {
        return this.indexOf((item) => {
            const itemKey = Colibri.UI.List.Group.CreateKey(item.value); 
            return itemKey === key;
        });
    }

    get label() {
        return this._span.html();
    }

    set label(value) {
        this._span.html(value);
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
        return this.Map((name, item, index) => item.value);
    }

    set value(value) {

        if(!(Symbol.iterator in Object(value))) {
            return;
        }

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
            this.AddItem(item, null, null, index++);
        }

        for(const key of oldKeys) {
            if(newKeys.indexOf(key) === -1) {
                const foundIndex = this.FindByKey(key);
                if(foundIndex !== -1) {
                    const item = this.Children(foundIndex);
                    item.Dispose();
                }
            }
        }

    }

    set noItemsText(value) {
        this._div.attr('data-empty', value);
    }
    
    get noItemsText() {
        return this._div.attr('data-empty');
    }

    get container() {
        return this._element.querySelector('div');
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
        super.Clear();
        this.container.html('');
    }

    /**
     * @deprecated
     */
    set items(value) {
        this.value = value;
    }
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
        this.AddHandler('MouseUp', (event, args) => this.parent.parent.Dispatch('ItemMouseUp', args));

        this.AddHandler('ContextMenuIconClicked', (event, args) => this.parent.Dispatch('ContextMenuIconClicked', Object.assign({item: this}, args)));
        this.AddHandler('ContextMenuItemClicked', (event, args) => this.parent.Dispatch('ContextMenuItemClicked', Object.assign({item: this}, args)));

    }


    /** @type {boolean} */
    get selected() {
        return this._element.is('.app-component-selected');
    }

    set selected(value) {
        if (value) {
            this.AddClass('app-component-selected');
            this._element.ensureInViewport(this.parent?.parent?.container ?? document.body);
        } else {
            this.RemoveClass('app-component-selected');
        }
    }

    __ItemSelected(event, args) {
        this.parent.parent.Dispatch('ItemClicked', {item: this, domEvent: args.domEvent});
    }

    __ItemDblSelected(event, args) {
        this.parent.parent.Dispatch('ItemDoubleClicked', {item: this, domEvent: args.domEvent});
    }

    __ItemMouseDown(event, args) {
        if(this.parent?.parent) {
            this.parent.parent.selected = this;
            this.parent?.parent?.Dispatch('ItemMouseDown', {item: this, domEvent: args.domEvent});
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
        
        let html = this._itemData.title;
        if(this.parent.parent.__renderItemContent) {
            html = this.parent.parent.__renderItemContent(this._itemData, this);
        }
        else if(this._itemData.__render) {
            html = this._itemData.__render.apply(this, [this._itemData, this]);
        }
        else if(this.parent.parent.rendererComponent) {
            let content = this.Children(this.name + '_renderer');
            if(!content) {
                const attrs = this.parent.parent.rendererAttrs;
                let comp = this.parent.parent.rendererComponent;
                if(!(comp instanceof Colibri.UI.Component)) {
                    comp = eval(comp);
                }
                content = new comp(this.name + '_renderer', this);
                content.shown = true;
                Object.forEach(attrs, (key, value) => {
                    content[key] = value;
                });
            }
            content.value = this._itemData;
            html = null;
        } 
        
        if(html) {
            this._element.html(html);
        }

        let data = Object.assign({}, this._itemData);
        delete data.__render;

        this._element.tag(data);
    }

    get contextmenu() {
        return this.parent.contextmenu;
    }

    set contextmenu(items) {
        this.parent.contextmenu = items;
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

}
