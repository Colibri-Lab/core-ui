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

        this.AddClass('app-component-keyvalueobject-field');
        this._enabled = true;

        const contentContainer = this.contentContainer;

        this._grid = new Colibri.UI.Grid('grid', contentContainer);
        this._grid.shown = true;
        this._grid.rows.title = '';
        this._grid.height = this.contentContainer.height - 30;

        this._link = new Colibri.UI.Link('link', contentContainer);
        this._link.shown = true;
        this._link.value = this._fieldData?.params?.addlink && !Object.isEmpty(this._fieldData?.params?.addlink) ?
            Lang.Translate(this._fieldData?.params?.addlink) :
            '#{ui-fields-keyvalueobject-add}'

        if (this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if (this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        this.hasImport = this._fieldData?.params?.has_import ?? false;

        this._grid.hasContextMenu = true;

        const column1 = this._grid.header.columns.Add('key', '');
        column1.width = '50%';
        column1.align = 'left';
        column1.editor = this._fieldData?.params?.keyEditor || Colibri.UI.TextEditor;
        column1.editorAllways = true;
        column1.resizable = true;
        column1.value = Lang.Translate(this._fieldData?.params?.keyTitle) || '#{ui-fields-keyvalueobject-key}';

        const column2 = this._grid.header.columns.Add('value', '');
        column2.width = '50%';
        column2.align = 'left';
        column2.editorAllways = true;
        column2.editor = this._fieldData?.params?.valueEditor || Colibri.UI.TextEditor;
        column2.value = Lang.Translate(this._fieldData?.params?.valueTitle) || '#{ui-fields-keyvalueobject-value}';

        this._grid.AddHandler('ContextMenuIconClicked', this.__gridContextMenuIconClicked, false, this);
        this._grid.AddHandler('ContextMenuItemClicked', this.__gridContextMenuItemClicked, false, this);
        this._grid.AddHandler('CellEditorChanged', this.__gridCellEditorChanged, false, this);
        this._link.AddHandler('Clicked', this.__linkClicked, false, this);

        this.canEditKey = this._fieldData?.params?.canEditKey ?? true;
        this.canAddNew = this._fieldData?.params?.canAddNew ?? true;
        this.canRemoveRows = this._fieldData?.params?.canRemoveRows ?? true;


    }

    __linkClicked(event, args) {
        this._grid.rows.Add('row' + Date.Mc(), { key: 'new-key-' + (this._grid.rows.children - 1), value: '' });
    }

    __gridCellEditorChanged(event, args) {
        return this.Dispatch('Changed', { component: this });
    }

    __gridContextMenuIconClicked(event, args) {
        args.item.contextmenu = [{ name: 'remove', title: '#{ui-fields-keyvalueobject-remove}' }];
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], '', args.isContextMenuEvent ? { left: args.domEvent.clientX, top: args.domEvent.clientY } : null);
    }

    __gridContextMenuItemClicked(event, args) {
        if (args.menuData?.name) {
            if (args.menuData?.name === 'remove') {
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
    Focus(element = 'firstVisibleChild') {
        this._grid.Focus(element);
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
        if (this._enabled != value) {
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
            this._grid.rows.Add('row' + Date.Mc(), { key: key, value: value });
        });

        if (this._grid.rows.children === 1 && this._fieldData?.params?.initempty === true) {
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
        this._grid.header.columns.Children('key').editor = !value ? null : (this._fieldData?.params?.keyEditor || Colibri.UI.TextEditor);
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

    /**
     * Has the import funcionality
     * @type {Boolean}
     */
    get hasImport() {
        return this._hasImport;
    }
    /**
     * Has the import funcionality
     * @type {Boolean}
     */
    set hasImport(value) {
        this._hasImport = value;
        this._showHasImport();
    }
    _showHasImport() {
        if (this._hasImport) {
            this._import = new Colibri.UI.Link('import', this.contentContainer);
            this._import.shown = true;
            this._import.value = '#{ui-fields-keyvalueobject-import}';
            this._import.AddHandler('Clicked', this.__importClicked, false, this);

            this._export = new Colibri.UI.Link('export', this.contentContainer);
            this._export.shown = true;
            this._export.value = '#{ui-fields-keyvalueobject-export}';
            this._export.AddHandler('Clicked', this.__exportClicked, false, this);
        } else {
            if (this._import) {
                this._import.Dispose();
                this._import = null;
            }
            if (this._export) {
                this._export.Dispose();
                this._export = null;
            }
        }
    }

    __exportClicked(event, args) {
        const data = JSON.stringify(this.value, null, 4);
        data.copyToClipboard().then(() => {
            App.Notices.Add(new Colibri.UI.Notice('#{ui-fields-keyvalueobject-copied}', Colibri.UI.Notice.Success));
        });
    }

    __importClicked(event, args) {
        App.Prompt.Show('#{ui-fields-keyvalueobject-importtitle}', {
            d: {
                component: 'TextArea',
                placeholder: '#{ui-fields-keyvalueobject-importplaceholder}'
            }
        }, '#{ui-fields-keyvalueobject-importbutton}').then((data) => {
            this.value = JSON.parse(data.d);
            return this.Dispatch('Changed', { component: this });
        });
    }



}
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'addlink', {
    type: 'varchar',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-addlink}',
    note: '#{ui-fields-keyvalueobject-fieldparams-addlink-note}',
    component: 'App.Modules.Lang.UI.TextArea',
    default: '',
    params: {
        compact: true,
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'addlink')
        }
    }
});

Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'canEditKey', {
    type: 'bool',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-caneditkey}',
    note: '#{ui-fields-keyvalueobject-fieldparams-caneditkey-note}',
    component: 'Checkbox',
    default: false,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'canEditKey')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'canAddNew', {
    type: 'bool',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-canaddnew}',
    note: '#{ui-fields-keyvalueobject-fieldparams-canaddnew-note}',
    component: 'Checkbox',
    default: false,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'canAddNew')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'canRemoveRows', {
    type: 'bool',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-canremoverows}',
    note: '#{ui-fields-keyvalueobject-fieldparams-canremoverows-note}',
    component: 'Checkbox',
    default: false,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'canRemoveRows')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'keyTitle', {
    type: 'varchar',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-keytitle}',
    note: '#{ui-fields-keyvalueobject-fieldparams-keytitle-note}',
    component: 'App.Modules.Lang.UI.Text',
    default: '',
    params: {
        compact: true,
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'keyTitle')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'keyEditor', {
    type: 'varchar',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-keyeditor}',
    note: '#{ui-fields-keyvalueobject-fieldparams-keyeditor-note}',
    component: 'Select',
    default: '',
    params: {
        compact: true,
        readonly: false,
        searchable: false,
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'keyEditor') && data.canEditKey
        }
    },
    selector: {
        value: 'value',
        title: 'title'
    },
    lookup: () => new Promise((resolve, reject) => {
        resolve(Colibri.UI.Editor.Enum().map(v => { return { value: v.value, title: v.value + ' ' + v.title }; }));
    })
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'valueTitle', {
    type: 'varchar',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-valuetitle}',
    note: '#{ui-fields-keyvalueobject-fieldparams-valuetitle-note}',
    component: 'App.Modules.Lang.UI.Text',
    default: '',
    params: {
        compact: true,
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'valueTitle')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'valueEditor', {
    type: 'varchar',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-valueeditor}',
    note: '#{ui-fields-keyvalueobject-fieldparams-valueeditor-note}',
    component: 'Select',
    default: '',
    params: {
        compact: true,
        readonly: false,
        searchable: false,
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'valueEditor')
        }
    },
    selector: {
        value: 'value',
        title: 'title'
    },
    lookup: () => new Promise((resolve, reject) => {
        resolve(Colibri.UI.Editor.Enum().map(v => { return { value: v.value, title: v.value + ' ' + v.title }; }));
    })
});

Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.KeyValueObject', 'has_import', {
    type: 'bool',
    placeholder: '#{ui-fields-keyvalueobject-fieldparams-has_import}',
    note: '#{ui-fields-keyvalueobject-fieldparams-has_import-note}',
    component: 'Checkbox',
    default: false
});


Colibri.UI.Forms.Field.RegisterFieldComponent('KeyValueObject', 'Colibri.UI.Forms.KeyValueObject', '#{ui-fields-keyvalueobject}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'transformer', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler', 'addlink', 'keyTitle', 'valueTitle', 'keyEditor', 'valueEditor', 'canEditKey', 'canAddNew', 'canRemoveRows', 'has_import']);
