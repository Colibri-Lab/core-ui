/**
 * @class
 * @namespace
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.ArrayGrid = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
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

    /** @protected */
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

    __objectGridSelectionChanged(event, args) {
        // do not open the window if the context menu is called on the row
        const selected = this._getSelected();
        if (args.isContextMenuEvent !== true && selected) {
            this.showObject(selected.value);
        }
    }

    /** @private */
    _renderAddObjectButton() {
        this._addObjectButton = new Colibri.UI.OutlineBlueButton(this._name + '-add-object-button', this.contentContainer);
        this._addObjectButton.value = Lang.Translate(this._fieldData.params?.addlink) || '#{ui-arraygrid-add} «' + (Lang.Translate(this._fieldData.desc)) + '»';
        this._addObjectButton.shown = true;
    }

    /** @private */
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

    __objectWindowWindowClosed(event, args) {
        if (this._objectWindow.disposeOnClose) { this._objectWindow = null; }
    }

    __objectWindowChanged(event, args) {
        if (!this._objectWindow.containsNewObject) {
            this.updateObjectRow(event, Object.assign({ object_row: this._getSelected() }, args));
        }
    }

    __objectWindowFormSubmited(event, args) {
        let newArgs = Object.assign({ object_row: this._getSelected() }, args);
        if (this._objectWindow.containsNewObject) {
            this.addObjectRow(args.value)
        } else {
            this.updateObjectRow(args.value);
        }

        this._objectsGrid.UnselectAllRows();
    }

    newObject(event, args) {
        this._openObjectWindow();
    }

    showObject(value) {
        this._openObjectWindow(value);
    }

    addObjectRow(value) {
        this._objectsGrid.rows.Add('row-' + Date.Now().getTime(), value || {});
        this.Dispatch('Changed');
    }

    updateObjectRow(value) {
        let row = this._getSelected();
        if (row) {
            row.value = value;
            this.Dispatch('Changed');
        }
    }

    /**
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

/**
 * @class
 * @extends Colibri.UI.ModelessWindow
 * @memberof Colibri.UI.Forms.ArrayGrid
 */
Colibri.UI.Forms.ArrayGrid.ObjectWindow = class extends Colibri.UI.Window {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-component-array-grid-object-window');

        this.title = '#{ui-arraygrid-title}';

        this._containsNewObject = true;

        this._form = new Colibri.UI.Forms.Form(this._name + '-form', this.container);
        this._saveButton = new Colibri.UI.SuccessButton(this._name + '-save-button', this.footer);
        this._saveButton.value = '#{ui-arraygrid-save}';
        this._saveButton.AddHandler('Clicked', this.__saveButtonClicked, false, this);

        this._form.shown = true;
        this._saveButton.shown = true;
    }

    __saveButtonClicked(event, args) {
        this.Dispatch('FormSubmitted', { value: this._form.value });
        this.Hide();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('FormSubmitted', 'Когда форма внутри окна отправлена');
    }

    /**
     * Set a window params
     * @param {Object} params
     */
    setParams(params) {
        this.title = params.title;
        this.width = params.width;
        this.height = params.height;
        this.sticky = params.sticky;
        this.stickyX = params.sticky_x;
        this.stickyY = params.sticky_y;
        this.startPointX = params.start_point_x;
        this.startPointY = params.start_point_y;
        this.disposeOnClose = params.dispose_on_close;
    }

    /**
     * Form with object
     * @type {Colibri.UI.Forms.Form}
     */
    get form() {
        return this._form;
    }

    /**
     * Form fields
     * @type {Object}
     */
    get fields() {
        return this._form.fields;
    }
    /**
     * Form fields
     * @param {string|Object} value
     */
    set fields(value) {
        this._form.fields = value;
    }

    /**
     * Form values
     * @type {Object|null}
     */
    get value() {
        return this._form.value;
    }
    /**
     * Form values
     * @type {Object|null}
     */
    set value(value) {
        this._form.value = value || this._form.defaultValues();
    }

    /**
     * Is form contains new object
     * @type {boolean}
     */
    get containsNewObject() {
        return this._containsNewObject;
    }
    /**
     * Is form contains new object
     * @type {boolean}
     */
    set containsNewObject(value) {
        this._containsNewObject = (value === true || value === 'true');
    }

    /**
     * Returns root object
     * @type {object}
     */
    get root() {
        return this._form.root;
    }

    /**
     * Returns root object
     * @type {object}
     */
    set root(value) {
        this._form.root = value;
    }

}

Colibri.UI.Forms.Field.RegisterFieldComponent('ArrayGrid', 'Colibri.UI.Forms.ArrayGrid', '#{ui-fields-arraygrid}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler', 'vertical', 'addlink', 'removelink', 'updownlink', 'hasscroll', 'initempty', 'maxadd', 'title', 'removedesc', 'displayed_columns'])
