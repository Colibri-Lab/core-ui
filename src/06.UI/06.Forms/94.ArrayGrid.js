/**
 * ArrayGrid field component
 * @class
 * @namespace
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.ArrayGrid = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     * @protected
     * @ignore
     */
    RenderFieldContainer() {
        this.AddClass('app-component-array-grid-field');

        this._setDisplayedColumns();
        this._renderAddObjectButton();
        this._renderObjectsGrid();

        this._objectWindow = null;

        this._handleEvents();

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

    }

    /**
     * @ignore 
     * @protected 
     */
    _handleEvents() {
        /** Открыть окно с новым объектом */
        this._addObjectButton.AddHandler('Clicked', this.newObject, false, this);

        /** Открыть окно с выбранным объектом */
        this._objectsGrid.AddHandler('SelectionChanged', this.__objectGridSelectionChanged, false, this);

        /** Добавить строкам таблицы контекстное меню */
        this._objectsGrid.AddHandler('ContextMenuIconClicked', this.__showContextMenu, false, this);

        /** Вызвать нужный обработчик контекстного меню */
        this._objectsGrid.AddHandler('ContextMenuItemClicked', this.__processContextMenuAction, false, this);

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __objectGridSelectionChanged(event, args) {
        // do not open the window if the context menu is called on the row
        const selected = this._getSelected();
        if (args.isContextMenuEvent !== true && selected) {
            this.showObject(selected.value);
        }
    }

    /** 
     * @ignore
     * @private 
     */
    _renderAddObjectButton() {
        this._addObjectButton = new Colibri.UI.OutlineBlueButton(this._name + '-add-object-button', this.contentContainer);
        this._addObjectButton.value = Lang.Translate(this._fieldData.params?.addlink) || '#{ui-arraygrid-add} «' + (Lang.Translate(this._fieldData.desc)) + '»';
        this._addObjectButton.shown = true;
    }

    /** 
     * @ignore
     * @private 
     */
    _renderObjectsGrid() {
        this._objectsGrid = new Colibri.UI.Grid(this._name + '-container-grid', this.contentContainer);
        this._objectsGrid.selectionMode = Colibri.UI.Grid.FullRow;
        this._objectsGrid.hasContextMenu = true;
        this._objectsGrid.shown = true;
        this._objectsGrid.rows.title = '';

        this._displayedColumns.forEach((column) => {
            let newColumn = this._objectsGrid.header.columns.Add(column.name, Lang.Translate(column.title));
            newColumn.viewer = column.viewer || null;
            newColumn.editor = column.editor || null;
        });
    }

    /**
     * Opens window for clicked object
     * @param {Object|null} value
     * @private
     * @ignore
     */
    _openObjectWindow(value) {
        if (!this._objectWindow) {
            this._objectWindow = new Colibri.UI.Forms.ArrayGrid.ObjectWindow(this._name + '-object-window', document.body);
            this._objectWindow.parent = this;
            this._objectWindow.closable = true;

            this._objectWindow.fields = this._fieldData.fields;
            if (this._fieldData?.desc) {
                this._objectWindow.title = Lang.Translate(this._fieldData.desc);
            }
            // this._objectWindow.stickyX = "center";
            // this._objectWindow.stickyY = "center";
            this._objectWindow.root = this.root;
            this._objectWindow.width = this.width;

            if (this._fieldData.params?.window) { this._objectWindow.setParams(this._fieldData.params.window); }

            this._objectWindow.AddHandler('FormSubmitted', this.__objectWindowFormSubmited, false, this);
            this._objectWindow.AddHandler('Changed', this.__objectWindowChanged, false, this);
            this._objectWindow.AddHandler('WindowClosed', this.__objectWindowWindowClosed, false, this);
        }

        this._objectWindow.containsNewObject = !!!value;
        this._objectWindow.value = value || null;
        this._objectWindow.shown = true;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __objectWindowWindowClosed(event, args) {
        if (this._objectWindow.disposeOnClose) { this._objectWindow = null; }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __objectWindowChanged(event, args) {
        if (!this._objectWindow.containsNewObject) {
            this.updateObjectRow(event, Object.assign({ object_row: this._getSelected() }, args));
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __objectWindowFormSubmited(event, args) {
        let newArgs = Object.assign({ object_row: this._getSelected() }, args);
        if (this._objectWindow.containsNewObject) {
            this.addObjectRow(args.value)
        } else {
            this.updateObjectRow(args.value);
        }

        this._objectsGrid.UnselectAllRows();
    }

    /**
     * Add new object (open the window)
     * @public
     */
    newObject(event, args) {
        this._openObjectWindow();
    }

    /**
     * Show object (open the window)
     * @param {*} value field value
     * @public
     */
    showObject(value) {
        this._openObjectWindow(value);
    }

    /**
     * Add object row
     * @param {*} value field value
     * @public
     */
    addObjectRow(value) {
        this._objectsGrid.rows.Add('row-' + Date.Now().getTime(), value || {});
        this.Dispatch('Changed');
    }

    /**
     * Update object row
     * @param {*} value field value
     * @public
     */
    updateObjectRow(value) {
        let row = this._getSelected();
        if (row) {
            row.value = value;
            this.Dispatch('Changed');
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __showContextMenu(event, args) {
        args.domEvent.preventDefault();
        args.domEvent.stopPropagation();

        let contextmenu = [
            {
                name: 'show-object',
                title: '#{ui-arraygrid-contextmenu-edit}',
                icon: Colibri.UI.ContextMenuEditIcon
            },
            {
                name: 'remove-object-row',
                title: '#{ui-arraygrid-contextmenu-remove}',
                icon: Colibri.UI.ContextMenuRemoveIcon
            },
            {
                name: 'up-object-row',
                title: '#{ui-arraygrid-contextmenu-up}',
                icon: Colibri.UI.UpIcon
            },
            {
                name: 'down-object-row',
                title: '#{ui-arraygrid-contextmenu-down}',
                icon: Colibri.UI.DownIcon
            },
        ];

        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT] : [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], '', args.isContextMenuEvent ? { left: args.domEvent.clientX, top: args.domEvent.clientY } : null);
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __processContextMenuAction(event, args) {
        if (args?.menuData && args?.item) {
            switch (args.menuData.name) {
                case 'show-object':
                    this._objectsGrid.UnselectAllRows();
                    args.item.selected = true;

                    this.showObject(args.item.value || null);
                    break;

                case 'remove-object-row':
                    args.item.Dispose();
                    break;
                case 'up-object-row':
                    args.item.MoveUp();
                    break;
                case 'down-object-row':
                    args.item.MoveDown();
                    break;
            }
        }
    }

    /**
     * Returns selected row
     * @return {Colibri.UI.Component[]}
     * @private
     */
    _getSelected() {
        return this._objectsGrid.selected;
    }

    /**
     * Gets a row by row or row name
     * @param {string|Colibri.UI.Grid.Row} value 
     * @return {null|Colibri.UI.Grid.Row}
     * @private
     */
    _getRow(value) {
        if (value) {
            return value instanceof Colibri.UI.Grid.Row ? value : this._objectsGrid.FindRow(value);
        }
        return null;
    }

    /**
     * Shows/hides columns
     * @private
     * @ignore
     */
    _setDisplayedColumns() {
        this._displayedColumns = [];
        let paramColumns = this._fieldData.params?.displayed_columns;
        if (typeof paramColumns === 'string') {
            paramColumns = paramColumns.split(';');
        }

        Object.forEach(this._fieldData.fields, (fieldName, fieldData) => {
            if (paramColumns !== undefined && paramColumns.indexOf(fieldName) === -1) {
                return;
            }

            let column = {};
            column['name'] = fieldName;
            column['title'] = fieldData.desc || '';
            column['viewer'] = fieldData?.params?.viewer ? fieldData.params.viewer : null;
            column['editor'] = fieldData?.params?.editor ? fieldData.params.editor : null;

            this._displayedColumns.push(column);
        });
    }

    /**
     * Focus on grid
     * @public
     */
    Focus() {
        // do nothing
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        // do nothing
    }
    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        // do nothing
    }

    /**
     * Value
     * @type {Object[]}
     */
    get value() {
        return this._objectsGrid.value;
    }
    /**
     * Value
     * @type {Object[]}
     */
    set value(value) {
        value = eval_default_values(value);
        if (value && !Array.isArray(value)) {
            throw new Error('#{ui-arraygrid-errors}');
        }

        this._objectsGrid.value = value;

    }

    /**
     * Fiels of object
     * @param {string|null} name имя поля, (если не указано, возвращает сразу все)
     * @return {Object|Colibri.UI.Forms.Field}
     * @constructor
     */
    Fields(name) {
        if (name) { return this._objectWindow?.form?.Children(name); }

        let fields = {};
        this._objectWindow?.form?.ForEach((name, field) => {
            if (field instanceof Colibri.UI.Forms.Field) { fields[name] = field; }
        });

        return fields;
    }

    /**
     * Tab indes
     * @type {number|boolean}
     */
    set tabIndex(value) {
        // do nothing
    }

    /**
     * Tab indes
     * @type {number|boolean}
     */
    get tabIndex() {
        return this._objectsGrid.tabIndex;
    }

}

Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'vertical', {
    type: 'bool',
    placeholder: '#{ui-fields-arraygrid-fieldparams-vertical}',
    note: '#{ui-fields-arraygrid-fieldparams-vertical-note}',
    component: 'Checkbox',
    default: false,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'vertical')
        }
    }
});

Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'removedesc', {
    type: 'bool',
    component: 'Checkbox',
    placeholder: '#{ui-fields-arraygrid-fieldparams-removedesc}',
    note: '#{ui-fields-arraygrid-fieldparams-removedesc-note}',
    default: true,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'removedesc')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'addlink', {
    type: 'varchar',
    placeholder: '#{ui-fields-arraygrid-fieldparams-addlink}',
    note: '#{ui-fields-arraygrid-fieldparams-addlink-note}',
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
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'removelink', {
    type: 'bool',
    placeholder: '#{ui-fields-arraygrid-fieldparams-removelink}',
    note: '#{ui-fields-arraygrid-fieldparams-removelink-note}',
    component: 'Checkbox',
    default: true,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'removelink')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'updownlink', {
    type: 'bool',
    placeholder: '#{ui-fields-arraygrid-fieldparams-updownlink}',
    note: '#{ui-fields-arraygrid-fieldparams-updownlink-note}',
    component: 'Checkbox',
    default: true,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'updownlink')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'hasscroll', {
    type: 'bool',
    placeholder: '#{ui-fields-arraygrid-fieldparams-hasscroll}',
    note: '#{ui-fields-arraygrid-fieldparams-hasscroll-note}',
    component: 'Checkbox',
    default: true,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'hasscroll')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'initempty', {
    type: 'bool',
    placeholder: '#{ui-fields-arraygrid-fieldparams-initempty}',
    note: '#{ui-fields-arraygrid-fieldparams-initempty-note}',
    component: 'Checkbox',
    default: true,
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'initempty')
        }
    }
});
Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'title', {
    type: 'varchar',
    placeholder: '#{ui-fields-arraygrid-fieldparams-title}',
    note: '#{ui-fields-arraygrid-fieldparams-title-note}',
    component: 'App.Modules.Manage.UI.TinyMCETextArea',
    default: '',
    params: {
        code: 'js',
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'title')
        }
    },
    attrs: {
        height: 200
    }
});

Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.ArrayGrid', 'displayed_columns', {
    type: 'varchar',
    placeholder: '#{ui-fields-arraygrid-fieldparams-displayed_columns}',
    note: '#{ui-fields-arraygrid-fieldparams-displayed_columns-note}',
    component: 'Text',
    default: '',
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'displayed_columns')
        }
    }
});

Colibri.UI.Forms.Field.RegisterFieldComponent('ArrayGrid', 'Colibri.UI.Forms.ArrayGrid', '#{ui-fields-arraygrid}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'transformer', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler', 'vertical', 'addlink', 'removelink', 'updownlink', 'hasscroll', 'initempty', 'maxadd', 'title', 'removedesc', 'displayed_columns'], true);
