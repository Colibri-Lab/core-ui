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
     * @returns {string}
     */
    static CreateKey(itemData, idField = null) {
        if(idField) {
            return itemData[idField];
        }
        return itemData?.__id ?? itemData?.id ?? String.MD5(JSON.stringify(Object.sortPropertiesRecursive(itemData))); 
    }

    /** 
     * @ignore
     * @protected
     */
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
     * @public
     */
    ForEach(handler) {
        this._div.ForEach(handler);
    }

    /**
     * Returns children by name
     * @param {string} name name of child component
     * @returns {Colibri.UI.Component}
     * @public
     */
    Items(name = null) {
        return this._div.Children(name);
    }

    /**
     * Adds a new item to the list
     * @param {object} itemData data of the item
     * @param {string} id id of the item
     * @param {boolean} selected is item selected
     * @param {number} index index of the item
     * @returns {Colibri.UI.List.Item}
     * @public
     */
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
     * @public
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
     * @public
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
     * @public
     */
    Collapse() {
        if (this.expandable) {
            this.AddClass('app-component-collapsed');
            if (this.parent instanceof Colibri.UI.List) {
                this.parent.Dispatch('GroupToggled', {state: 'collapsed'});
            }
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
     * @public
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

    /**
     * Shows last item of group
     * @public
     */
    ShowLastMessage() {
        const last = this.Items('lastChild');
        if(last) {
            this._div.ScrollTo(10000000);
        }
    }

}