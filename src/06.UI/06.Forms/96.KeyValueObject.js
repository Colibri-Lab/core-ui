/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.KeyValueObject = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-simplearray-field');
        this._enabled = true;

        const contentContainer = this.contentContainer;

        this._grid = new Colibri.UI.Grid('grid', contentContainer);
        this._grid.shown = true;
        this._grid.rows.title = '';
        this._grid.height = 200;

        this._link = new Colibri.UI.Link('link', contentContainer);
        this._link.shown = true;
        this._link.value = this._fieldData?.params?.addlink && !Object.isEmpty(this._fieldData?.params?.addlink) ? 
            Lang.Translate(this._fieldData?.params?.addlink) : 
            '#{ui-fields-keyvalueobject-add}'

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        this._fieldData.params.simplearraywidth = (this._fieldData.params?.simplearraywidth ?? 1);
        this._fieldData.params.simplearrayheight = (this._fieldData.params?.simplearrayheight ?? 1);

        this._grid.hasContextMenu = true;

        const column1 = this._grid.header.columns.Add('key', '');
        column1.width = '50%';
        column1.align = 'left';
        column1.editor = Colibri.UI.TextEditor;
        column1.editorAllways = true;
        column1.resizable = true;
        column1.value = this._fieldData?.params?.keyTitle || '#{ui-fields-keyvalueobject-key}';

        const column2 = this._grid.header.columns.Add('value', '');
        column2.width = '50%';
        column2.align = 'left';
        column2.editorAllways = true;
        column2.editor = this._fieldData?.params?.valueEditor || Colibri.UI.TextEditor;
        column2.value = this._fieldData?.params?.valueTitle || '#{ui-fields-keyvalueobject-value}';

        this._grid.AddHandler('ContextMenuIconClicked', (event, args) => this.__gridContextMenuIconClicked(event, args));
        this._grid.AddHandler('ContextMenuItemClicked', (event, args) => this.__gridContextMenuItemClicked(event, args));
        this._grid.AddHandler('CellEditorChanged', (event, args) => this.Dispatch('Changed', {component: this}));
        this._link.AddHandler('Clicked', (event, args) => this._grid.rows.Add('row' + Date.Mc(), {key: 'new-key-' + (this._grid.rows.children - 1), value: ''}));

    }
    
    __gridContextMenuIconClicked(event, args) {
        args.item.contextmenu = [{name: 'remove', title: '#{ui-fields-keyvalueobject-remove}'}];
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RB] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.LB], '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
    }

    __gridContextMenuItemClicked(event, args) {
        if(args.menuData?.name) {
            if(args.menuData?.name === 'remove') {
                args.item.Dispose();
            }
        }
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    /**
     * Focus on component
     */
    Focus() {
        this.contentContainer.Children('firstChild').Focus();
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._grid.readonly;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._grid.readonly = value;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._enabled ?? true;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if(this._enabled != value) {
            this._enabled = value;
            this.contentContainer.ForEach((name, component) => {
                component.enabled = this._enabled; 
            });
            this._link && (this._link.enabled = this._enabled);
        }
    }

    /**
     * Value
     * @type {Array}
     */
    get value() {

        let val = {};
        this._grid.ForEveryRow((name, row) => {
            val[row.value.key] = row.value.value;
        });
        return val;
    }

    /**
     * Value
     * @type {Array}
     */
    set value(value) {
        this._grid.ClearAllRows();
        
        Object.forEach(value, (key, value) => {
            this._grid.rows.Add('row' + Date.Mc(), {key: key, value: value});
        });

        if(this._grid.rows.children === 1 && this._fieldData?.params?.initempty === true) {
            this._link.Dispatch('Clicked');
        }

    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    set tabIndex(value) {
        this._grid.tabIndex = value;
    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    get tabIndex() {
        return this._grid.tabIndex;
    }

    /**
     * Height
     * @type {number}
     */
    get height() {
        return this._grid.height;
    }
    /**
     * Height
     * @type {number}
     */
    set height(value) {
        this._grid.height = value;
    }

    /**
     * Can add new rows
     * @type {Boolean}
     */
    get canAddNew() {
        return this._link.shown;
    }
    /**
     * Can add new rows
     * @type {Boolean}
     */
    set canAddNew(value) {
        this._link.shown = value;
    }

    /**
     * Can user remove rows
     * @type {Boolean}
     */
    get canRemoveRows() {
        return this._grid.hasContextMenu;
    }
    /**
     * Can user remove rows
     * @type {Boolean}
     */
    set canRemoveRows(value) {
        this._grid.hasContextMenu = value;
    }

    /**
     * Can the user change keys
     * @type {Boolean}
     */
    get canEditKey() {
        return this._grid.header.columns.Children('key').editor != null;
    }
    /**
     * Can the user change keys
     * @type {Boolean}
     */
    set canEditKey(value) {
        this._grid.header.columns.Children('key').editor = !value ? null : Colibri.UI.TextEditor;
    }

    /**
     * Editor for value field
     * @type {Colibri.UI.Editor}
     */
    get valueEditor() {
        return this._grid.header.columns.Children('value').editor;
    }
    /**
     * Editor for value field
     * @type {Colibri.UI.Editor}
     */
    set valueEditor(value) {
        this._grid.header.columns.Children('value').editor = value;
    }
    

}
Colibri.UI.Forms.Field.RegisterFieldComponent('KeyValueObject', 'Colibri.UI.Forms.KeyValueObject', '#{ui-fields-keyvalueobject}')
