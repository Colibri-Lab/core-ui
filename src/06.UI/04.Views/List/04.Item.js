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

    /** 
     * @ignore
     * @protected
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
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
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __ItemSelected(event, args) {
        if(this.list) {
            const lastSelection = this.list.selected;
            this.list.selected = this;
            this.list.Dispatch('ItemClicked', Object.assign(args, {item: this, before: lastSelection, domEvent: args.domEvent}));
        }
    }

    /**
     * @ignore
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
     * @ignore
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

    /**
     * Dispose item
     * @public
     */
    Dispose() {
        this.list.UnselectItem(this);
        this._content && this._content.Dispose();
        if(this.hasContextMenu) {
            this._removeContextMenuButton();
        }
        super.Dispose();
    }

    /**
     * Rendered content component
     * @type {Colibri.UI.Component}
     */
    get content() {
        return this._content;
    }

}
