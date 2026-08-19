/**
 * @class
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

        this._element.addEventListener('scroll', this.__scrollHandler);

        this.AddHandler('ReceiveFocus', this.__thisReceiveFocus);
        this.AddHandler('LoosedFocus', this.__thisLoosedFocus);

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisReceiveFocus (event, args) {
        this.AddClass('-focused');
    }
    
    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisLoosedFocus(event, args) {
        this.RemoveClass('-focused');
    }

    /**
     * Disposes the component
     * @public
     */
    Dispose() {
        this._element.removeEventListener('scroll', this.__scrollHandler);
        super.Dispose();
    }

    /** 
     * @ignore
     * @protected
     */
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
     * @public
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
     * @public
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
     * @public
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
     * @public
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
     * @private
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

    /**
     * Selected Item Group index
     * @type {number}
     */
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
     * @public
     */
    ShowSelection() {
        
        if(this._selected.length > 0) {
            this._selected[0].EnsureVisible();
        }

    }

    /**
     * Show last item in the list
     * @public
     */
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

    /**
     * @private
     * @ignore
     */
    _isMultipleKeyPressed() {
        if(!this._multipleSelectionKey) {
            return true;
        }
        const keys = this._multipleSelectionKey.split('+');
        return keys.map(v => document.keysPressed[v] ? 1 : 0).sum() > 0;
    }

    /**
     * Removes all groups from list
     * @public
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
     * @public
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

    /** 
     * @ignore
     * @protected
     */
    _createContextMenuButton() {
        // Do nothing
    }

    /**
     * @ignore
     * @protected
     */
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
     * @ignore
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
            this.AddClass('app-component-has-search');
            this._searchBox = new Colibri.UI.List.SearchBox(this.name + '-searchbox', this);
            this._searchBox.shown = true;
            this._searchBox.AddHandler('Changed', this.__searchBoxChanged, false, this);
        } else if(this._searchBox) {
            this.RemoveClass('app-component-has-search');
            this._searchBox.Dispose();
            this._searchBox = null;
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     * @ignore
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
     * @public
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

