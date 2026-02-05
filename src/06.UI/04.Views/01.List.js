/**
 * @class
 * @namespace
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.List = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {Element|string} element element to create in
     * @param {boolean} multiple is list has multiple selection 
     */
    constructor(name, container, element, multiple) {
        super(name, container, element);
        this.AddClass('app-component-list');

        this._canSelect = true;
        this.AddClass('-can-select');
        this._selected = [];

        if (multiple === undefined) {
            multiple = false;
        }
        this._multipleSelectionKey = '';
        this._multiple = multiple;

        this.tabIndex = -1;
        // this._scrolling = -1;
        // this._scrollY = -1;

        // this.__scrollHandler = (event) => {
        //     try {
        //         if(event.target.scrollTop > this._scrollY) {
        //             if (this.Children('lastChild').container.getBoundingClientRect().bottom < (event.target.getBoundingClientRect().bottom + 10)) {
        //                 clearTimeout(this._scrolling);
        //                 this._scrolling = setTimeout(() => {
        //                     this.Dispatch('ScrolledToBottom', {});
        //                 }, 66);
        //             }
        //         }
        //         this._scrollY = event.target.scrollTop;    
        //     }
        //     catch(e) {

        //     }
        // };

        this._element.addEventListener('scroll', this.__scrollHandler);

        this.AddHandler('ReceiveFocus', this.__thisReceiveFocus);
        this.AddHandler('LoosedFocus', this.__thisLoosedFocus);

    }

    __thisReceiveFocus (event, args) {
        this.AddClass('-focused');
    }
    
    __thisLoosedFocus(event, args) {
        this.RemoveClass('-focused');
    }

    Dispose() {
        this._element.removeEventListener('scroll', this.__scrollHandler);
        super.Dispose();
    }

    /** @protected */
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

    /**
     * Adds a new group to list
     * @param {string} name name of group
     * @param {string} title title of group
     * @returns Colibri.UI.List.Group
     */
    AddGroup(name, title) {
        const group = new Colibri.UI.List.Group(name, this);
        group.label.value = title;
        group.shown = true;
        group.hasContextMenu = this.hasContextMenu;
        group.clickWhenContextMenuClicked = this.clickWhenContextMenuClicked;
        return group;
    }

    /**
     * Search for item
     * @param {Function|string} searchingItemIdOrCompareMethod item id or compare method
     * @returns {Colibri.UI.List.Item}
     */
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
                    return null;
                }

            });
            if(found) {
                return null;
            }
        });

        return found;
    }

    /**
     * Unselect items
     * @param {Colibri.UI.List.Item[]} selected items to unselect
     */
    UnselectItem(selected) {
        if(!this._multiple || !this._isMultipleKeyPressed()) {
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
     * Select the item
     * @param {Colibri.UI.List.Item} selected
     */
    SelectItem(selected) {
        if(!this._canSelect || !selected) {
            return;
        }
        if(!this._multiple || !this._isMultipleKeyPressed()) {
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
     * Select the item
     * @deprecated
     * @param {Colibri.UI.List.Item} selected
     */
    _selectItem(selected) {
        return this.SelectItem(selected);
    }

    /**
     * Selected index
     * @type {number}
     */
    get selectedIndex() {
        
        if(this._selected.length == 0) {
            return null;
        }

        const indices = this._selected.map(o => o.childIndex);

        return this._multiple ? indices : indices.pop();

    }

    get selectedItemGroupIndex() {
        if(this._selected.length == 0) {
            return null;
        }

        if(this._multiple) {
            return this._selected.map(v => v.parent.parent.childIndex)
        } 

        return this._selected[0]?.parent?.parent?.childIndex ?? 0;

    }
    
    /**
     * Selected index
     * @type {number}
     */
    set selectedIndex(value) {
        
        const currentSelection = JSON.stringify(this.selectedIndex);
        const currentGroupSelection = JSON.stringify(this.selectedItemGroupIndex);

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

        if(JSON.stringify(this.selectedIndex) != currentSelection || JSON.stringify(this.selectedItemGroupIndex) != currentGroupSelection) {
            this.Dispatch('SelectionChanged', {selected: this.selected});
        }

    }

    /** 
     * Selected Item value
     * @type {Object|Array} 
     */
    get selectedValue() {
        let values = [];
        this._selected.forEach((item) => {
            values.push(item.value);
        });
        return this._multiple ? values : values.pop();
    }

    /** 
     * Selected Item value
     * @type {Object|Array} 
     */
    set selectedValue(value) {

        if(!this._multiple && Array.isArray(value)) {
            return;
        }
        
        const currentSelection = JSON.stringify(this.selectedIndex);
        const currentGroupSelection = JSON.stringify(this.selectedItemGroupIndex);

        // value обьект значения
        let selected = this._multiple ? [] : null;
        this.ForEach((name, group) => {
            group.ForEach((n, item) => {
                if(this._multiple) {
                    const v = (item.value?.id ?? item.value);
                    for(const vv of value) {
                        if(v == (vv.id ?? vv)) {
                            selected.push(item);
                            break;
                        }
                    }
                } else {
                    if((item.value?.id ?? item.value) == (value?.id ?? value)) {
                        selected = item;
                        return false;
                    }
                }
            });
        });

        if(!selected || selected?.length === 0) {
            return;
        }

        if(this._multiple) {
            for(const s of selected) {
                this.SelectItem(s);
            }
        } else {
            this.SelectItem(selected);
        }

        if(JSON.stringify(this.selectedIndex) != currentSelection || JSON.stringify(this.selectedItemGroupIndex) != currentGroupSelection) {
            this.Dispatch('SelectionChanged', {selected: this.selected});
        }

    }


    /**
     * Selected item 
     * @type {Colibri.UI.List.Item} 
     */
    get selected() {
        if (!this._multiple) {
            return this._selected[0];
        }
        return this._selected;
    }
    /**
     * Selected item 
     * @type {Colibri.UI.List.Item} 
     */
    set selected(value) {
        // value - Colibri.UI.Item
        const currentSelection = JSON.stringify(this.selectedIndex);
        const currentGroupSelection = JSON.stringify(this.selectedItemGroupIndex);
        
        this.SelectItem(value);
        
        if(JSON.stringify(this.selectedIndex) != currentSelection || JSON.stringify(this.selectedItemGroupIndex) != currentGroupSelection) {
            this.Dispatch('SelectionChanged', {selected: this.selected});
        }
    }

    /**
     * Show selection, ensures visibility of selected item
     */
    ShowSelection() {
        
        if(this._selected.length > 0) {
            this._selected[0].EnsureVisible();
        }

    }

    
    ShowLastMessage() {
        const lastGroup = this.Children('lastChild');
        const last = lastGroup.Items('lastChild');
        if(last) {
            this.ScrollTo(10000000);
        }
    }

    /**
     * Is list can select multiple items
     * @type {boolean}
     */
    get multiple() {
        return this._multiple;
    }

    /**
     * Is list can select multiple items
     * @type {boolean}
     */
    set multiple(value) {
        this._multiple = value;
        if(value) {
            this.AddClass('-multiple');
        } else {
            this.RemoveClass('-multiple');
        }
    }

    /**
     * Key used for multiple selection
     * @type {string} ctrl+alt+shit or ctrl
     */
    get multipleSelectionKey() {
        return this._multipleSelectionKey;
    }

    /**
     * Key used for multiple selection
     * @type {string} ctrl+alt+shit or ctrl
     */
    set multipleSelectionKey(value) {
        this._multipleSelectionKey = value;
    }

    _isMultipleKeyPressed() {
        if(!this._multipleSelectionKey) {
            return true;
        }
        const keys = this._multipleSelectionKey.split('+');
        return keys.map(v => document.keysPressed[v] ? 1 : 0).sum() > 0;
    }

    /**
     * Removes all groups from list
     */
    ClearAllGroups() {
        this.ForEach((name, component) => {
            if(component instanceof Colibri.UI.List.Group) {
                component.Dispose();
            }
        })
    }

    /**
     * Clears selection
     * @param {boolean} fireAnEvent fire the SelectionChanged event
     */
    ClearSelection(fireAnEvent = true) {
        this._selected.forEach((item) => {
            item.selected = false;
        });
        this._selected = [];
        if(fireAnEvent) {
            this.Dispatch('SelectionChanged', {selected: this.selected});
        }
    }

    /** @protected */
    _createContextMenuButton() {
        // Do nothing
    }

    /** @protected */
    _removeContextMenuButton() {
        // Do nothing
    }

    /**
     * Items of list
     * @type {Array}
     */
    get value() {
        return [];
    }

    /**
     * Items of list
     * @type {Array}
     */
    set value(data) {

        this.ClearSelection(false);

        this.KeepInMind();

        const renderer = new Colibri.UI.List.JsonRenderer(this, data);
        renderer.Render();

        this.Retreive();

    } 

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {
        try {
            this.value = data;
        }
        catch(e) {

        }
    }

    /**
     * Renderer component
     * @type {string|Colibri.UI.Component|Function}
     */
    get rendererComponent() {
        return this._rendererComponent;
    }
    /**
     * Renderer component
     * @type {string|Colibri.UI.Component|Function}
     */
    set rendererComponent(value) {
        this._rendererComponent = value;
    }

    /**
     * Renderer component attributes
     * @type {string|Object}
     */
    get rendererAttrs() {
        return this._rendererAttrs;
    }
    /**
     * Renderer component attributes
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
            this._searchBox.AddHandler('Changed', this.__searchBoxChanged, false, this);
        } else if(this._searchBox) {
            this.RemoveClass('-has-search');
            this._searchBox.Dispose();
            this._searchBox = null;
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
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
     * Filter callback
     * @type {Function}
     */
    get searchFilterCallback() {
        return this._searchFilterCallback;
    }
    /**
     * Filter callback
     * @type {Function}
     */
    set searchFilterCallback(value) {
        this._searchFilterCallback = value;
    }

    /**
     * Sets the focus on searchbox
     */
    FocusOnSearchBox() {
        if(!this._searchBox) {
            return;
        }
        this._searchBox.Focus();
    }

    /**
     * Name of object field for ID
     * @type {String}
     */
    get idField() {
        return this._idField;
    }
    /**
     * Name of object field for ID
     * @type {String}
     */
    set idField(value) {
        this._idField = value;
    }
    
    /**
     * Maximum item count (at the end)
     * @type {Number|null}
     */
    get maxItems() {
        return this._maxItems;
    }
    /**
     * Maximum item count (at the end)
     * @type {Number|null}
     */
    set maxItems(value) {
        this._maxItems = value;
    }


}

/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.List
 */
Colibri.UI.List.SearchBox = class extends Colibri.UI.Pane {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-component-list-searchbox');

        this._input = new Colibri.UI.Input(this.name + '-input', this);
        this._input.shown = true;
        this._input.AddHandler(['Filled', 'Cleared'], this.__inputChangedOrFilled, false, this);
        this._input.AddHandler('KeyDown', this.__inputKeyDown, false, this);

    }

    __inputKeyDown(event, args) {
        args.domEvent.stopPropagation();
    }

    __inputChangedOrFilled(event, args) {
        this.Dispatch('Changed', args);
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Когда изменился поиск');
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

/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.List
 */
Colibri.UI.List.Group = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
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

    /**
     * Generates an ID for item
     * @static
     * @param {object} itemData data of item
     * @returns string
     */
    static CreateKey(itemData, idField = null) {
        if(idField) {
            return itemData[idField];
        }
        return itemData?.__id ?? itemData?.id ?? String.MD5(JSON.stringify(Object.sortPropertiesRecursive(itemData))); 
    }

    /** @protected */
    _handlerEvents() {

        this.AddHandler('ContextMenuIconClicked', (event, args) => event.sender.parent.Dispatch('ContextMenuIconClicked', Object.assign({item: args.item}, args)));
        this.AddHandler('ContextMenuItemClicked', (event, args) => event.sender.parent.Dispatch('ContextMenuItemClicked', Object.assign({item: args.item}, args)));

        this.AddHandler('Clicked', (sender, args) => {
            if (args.domEvent?.target?.tagName == 'SPAN' && args.domEvent?.target?.parentElement == this._element) {
                this.expanded = !this.expanded;
            }
        });
    }

    /**
     * Cycles for each children
     * @param {Function} handler method to execute for each child component
     */
    ForEach(handler) {
        this._div.ForEach(handler);
    }

    Items(name = null) {
        return this._div.Children(name);
    }

    AddItem(itemData, id = null, selected = false, index = null) {

        const newKey = Colibri.UI.List.Group.CreateKey(itemData, this.parent?.idField); 
        const foundItem = this.FindByKey(newKey);

        let control;
        if(foundItem !== -1) {
            control = this._div.Children(foundItem);
            control.value = itemData;
            if(index !== null) {
                this._div.Children(control.name, control, index);
            }
        } else {
            const name = (id || itemData?.id || '_' + Number.unique());
            control = new Colibri.UI.List.Item('item-' + name, this._div);
            control.shown = true;
            control.selected = selected;
            control.hasContextMenu = this.hasContextMenu;
            control.clickWhenContextMenuClicked = this.clickWhenContextMenuClicked;
            control.key = newKey;
            control.value = itemData;

            if(this.parent?.tag && this.parent?.tag?.params && this.parent?.tag?.params?.sort) {
                const foundIndex = this.parent.tag.params.sort(control, this);
                this._div.Children(name, control, foundIndex);
            }

            if(index !== null) {
                this._div.Children(control.name, control, index);
            }

        }

        if(selected) {
            this.parent.SelectItem(control);
        }

        if(!!this.parent.maxItems) {
            while(this._div.children > this.parent.maxItems) {
                this._div.Children('firstChild').Dispose();
            }
        }

        return control;

    }

    /**
     * Searches for index by key
     * @param {string} key key to search for
     * @returns {number}
     */
    FindByKey(key) {
        return this._div.indexOf((item) => {
            const itemKey = Colibri.UI.List.Group.CreateKey(item.value, this.parent?.idField); 
            return itemKey === key;
        });
    }

    /**
     * Childs
     * @type {Array}
     * @readonly
     */
    get children() {
        return this._div.children;
    }

    /**
     * Label element
     * @type {Element}
     */
    get label() {
        return this._span;
    }

    /**
     * Label element
     * @type {Element}
     */
    set label(value) {
        this._span.value = value;
    }

    /**
     * Is group expandable
     * @type {boolean}
     */    
    get expandable() {
        return this.ContainsClass('app-component-expandable');
    }

    /**
     * Is group expandable
     * @type {boolean}
     */    
    set expandable(value) {
        if (value) {
            this.AddClass('app-component-expandable');
        } else {
            this.RemoveClass('app-component-expandable');
        }
    }

    /**
     * Is group expanded
     * @type {boolean}
     */    
    get expanded() {
        return !this.ContainsClass('app-component-collapsed')
    }

    /**
     * Is group expanded
     * @type {boolean}
     */    
    set expanded(value) {
        if (this.ContainsClass('app-component-collapsed')) {
            this.Expand();
        } else {
            this.Collapse();
        }
    }

    /**
     * Value array
     * @type {Array}
     */    
    get value() {
        return this._div.Map((name, item, index) => item.value);
    }

    /**
     * Value array
     * @type {Array}
     */    
    set value(value) {

        this.parent && this.parent.ClearSelection(false);
        
        if(!(Symbol.iterator in Object(value))) {
            return;
        }

        this.KeepInMind();

        const oldKeys = [];
        const oldValues = this.value;
        for(const item of oldValues) {
            const key = Colibri.UI.List.Group.CreateKey(item, this.parent?.idField);
            oldKeys.push(key);
        }

        const newKeys = [];
        let index = 0;
        for(const item of value) {
            newKeys.push(Colibri.UI.List.Group.CreateKey(item, this.parent?.idField));
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
    
    /**
     * Renderer component
     * @type {string|Colibri.UI.Component|Function}
     */
    get rendererComponent() {
        return this._rendererComponent;
    }
    /**
     * Renderer component
     * @type {string|Colibri.UI.Component|Function}
     */
    set rendererComponent(value) {
        this._rendererComponent = value;
    }

    /**
     * Renderer component attributes
     * @type {string|Object}
     */
    get rendererAttrs() {
        return this._rendererAttrs;
    }
    /**
     * Renderer component attributes
     * @type {string|Object}
     */
    set rendererAttrs(value) {
        if(typeof value === 'string') {
            eval('value = ' + value + ';');
        }
        this._rendererAttrs = value;
    }

    /**
     * Expand group
     */
    Expand() {
        if (this.expandable) {
            this.RemoveClass('app-component-collapsed');
            if (this.parent instanceof Colibri.UI.List) {
                this.parent.Dispatch('GroupToggled', {state: 'expanded'});
            }
        }
    }

    /**
     * Collapse group
     */
    Collapse() {
        if (this.expandable) {
            this.AddClass('app-component-collapsed');
            if (this.parent instanceof Colibri.UI.List) {
                this.parent.Dispatch('GroupToggled', {state: 'collapsed'});
            }
        }
    }

    /** @protected */
    _createContextMenuButton() {
        // Do nothing
    }

    /** @protected */
    _removeContextMenuButton() {
        // Do nothing
    }

    /**
     * Context menu items
     * @type {Array}
     */
    get contextmenu() {
        return this.parent.contextmenu;
    }

    /**
     * Context menu items
     * @type {Array}
     */
    set contextmenu(items) {
        this.parent.contextmenu = items;
    }

    /**
     * Clear items
     */
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

    ShowLastMessage() {
        const last = this.Items('lastChild');
        if(last) {
            this._div.ScrollTo(10000000);
        }
    }

}

/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.List
 */
Colibri.UI.List.Item = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        super(name, container);

        this.AddClass('app-component-list-item');

        this.AddHandler('Clicked', this.__ItemSelected);
        this.AddHandler('DoubleClicked', this.__ItemDblSelected);
        this.AddHandler(['MouseDown', 'TouchStarted'], this.__ItemMouseDown);
        this.AddHandler(['MouseUp', 'TouchEnded'], this.__thisMouseUpOrTouchEnded);

        this.AddHandler('ContextMenuIconClicked', (event, args) => event.sender.group.Dispatch('ContextMenuIconClicked', Object.assign({item: event.sender}, args)));
        this.AddHandler('ContextMenuItemClicked', (event, args) => event.sender.group.Dispatch('ContextMenuItemClicked', Object.assign({item: event.sender}, args)));

    }

    __thisMouseUpOrTouchEnded(event, args) {
        this.list?.Dispatch('ItemMouseUp', args);
    }


    /**
     * Is item selected 
     * @type {boolean} 
     */
    get selected() {
        return this._element.is('.app-component-selected');
    }

    /**
     * Is item selected 
     * @type {boolean} 
     */
    set selected(value) {
        if (value) {
            this.AddClass('app-component-selected');
            // this._element.ensureInViewport(this.list?.container ?? document.body);
        } else {
            this.RemoveClass('app-component-selected');
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __ItemSelected(event, args) {
        if(this.list) {
            this.list.selected = this;
            this.list.Dispatch('ItemClicked', Object.assign(args, {item: this, domEvent: args.domEvent}));
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __ItemDblSelected(event, args) {
        if(this.list) {
            this.list.Dispatch('ItemDoubleClicked', {item: this, domEvent: args.domEvent});
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __ItemMouseDown(event, args) {
        if(this.list) {
            this.list?.Dispatch('ItemMouseDown', {item: this, domEvent: args.domEvent});
        }
    }

    /** 
     * Value object
     * @type {object}
     */
    get value() {
        return this._itemData;
    }

    /** 
     * Value object
     * @type {object}
     */
    set value(value) {

        const oldKey = String.MD5(JSON.stringify(Object.sortPropertiesRecursive(this._itemData)));
        const newKey = String.MD5(JSON.stringify(Object.sortPropertiesRecursive(value)));
        if(oldKey === newKey) {
            return;
        }

        this._itemData = value;
        
        let html = this._itemData?.title ?? '';
        let rendererComponent = this.group?.rendererComponent ?? this.list?.rendererComponent ?? null;
        const rendererAttrs = this.group?.rendererAttrs ?? this.list?.rendererAttrs ?? {};
        if(rendererComponent) {
            let name = (this._itemData?.id ?? this._itemData?.name ?? (this.name + '_renderer'));
            if(Lang) {
                name = Lang.Translate(name);
            }
            name = (name + '').replaceAll('"', '');
            this._content = this.Children(name);
            if(!this._content) {
                let comp = typeof(rendererComponent) === 'string' ? rendererComponent : rendererComponent(this._itemData, this);
                if(!(comp instanceof Colibri.UI.Component)) {
                    comp = eval(comp);
                }
                this._content = new comp(name, this);
                this._content.shown = true;
                this._content.parent = this;
                delete rendererAttrs.name;
                Object.forEach(rendererAttrs, (key, value) => {
                    this._content[key] = value;
                });
            }
            if(rendererAttrs?.render) {
                this._content[rendererAttrs?.render] = this._itemData;
            } else {
                this._content.value = this._itemData;
            }
            if(this.hasContextMenu) {
                this._removeContextMenuButton();
                this._createContextMenuButton();
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

    /** 
     * Context menu items
     * @type {Array}
     */
    get contextmenu() {
        return this.group.contextmenu;
    }

    /** 
     * Context menu items
     * @type {Array}
     */
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

    /**
     * List associated by item
     * @type {Colibri.UI.List}
     * @readonly
     */
    get list() {
        return this.group?.parent ?? null;
    }

    /**
     * List group associated by item
     * @type {Colibri.UI.List.Group}
     * @readonly
     */
    get group() {
        return this.parent?.parent ?? null;
    }

    Dispose() {
        this.list.UnselectItem(this);
        this._content && this._content.Dispose();
        if(this.hasContextMenu) {
            this._removeContextMenuButton();
        }
        super.Dispose();
    }

    get content() {
        return this._content;
    }

}
