Colibri.UI.Forms.ArrayGrid = class extends Colibri.UI.Forms.Field {
    RenderFieldContainer() {
        this.AddClass('app-component-array-grid-field');

        this._setDisplayedColumns();
        this._renderAddObjectButton();
        this._renderObjectsGrid();

        this._objectWindow = null;

        this._handleEvents();
    }

    _handleEvents() {
        /** Открыть окно с новым объектом */
        this._addObjectButton.AddHandler('Clicked', (event, args) => this.__newObject(event, args));

        /** Открыть окно с выбранным объектом */
        this._objectsGrid.AddHandler('SelectionChanged', (event, args) => {
            // не открываем окно, если на строке вызывают контекстное меню
            if (args.isContextMenuEvent !== true) {
                this.__showObject(event, Object.assign({object_row: this._getSelected()}, args))
            }
        });

        /** Добавить строкам таблицы контекстное меню */
        this._objectsGrid.AddHandler('ContextMenuIconClicked', (event, args) => this.__showContextMenu(event, args));

        /** Вызвать нужный обработчик контекстного меню */
        this._objectsGrid.AddHandler('ContextMenuItemClicked', (event, args) => this.__processContextMenuAction(event, args));

        this._objectsGrid.AddHandler('RowSelected', (event, args) => this.__toggleMassActionsMenu(event, args));

         this._objectsGrid.AddHandler('MassActionsMenuActionClicked', (event, args) => this.__processMassAction(event, args));
    }

    /**
     * Нарисовать кнопку добавления нового объекта
     * @private
     */
    _renderAddObjectButton() {
        this._addObjectButton = new Colibri.UI.OutlineBlueButton(this._name + '-add-object-button', this.contentContainer);
        this._addObjectButton.value = this._fieldData.params?.addlink || 'Добавить «' + (this._fieldData.desc) + '»';
        this._addObjectButton.shown = true;
    }

    /**
     * Нарисовать таблицу с нужными колонками
     * @private
     */
    _renderObjectsGrid() {
        this._objectsGrid = new Colibri.UI.Grid(this._name + '-container-grid', this.contentContainer);
        this._objectsGrid.selectionMode = Colibri.UI.Grid.FullRow;
        this._objectsGrid.hasContextMenu = true;
        this._objectsGrid.hasMassActionsMenu = true;
        this._objectsGrid.shown = true;

        this._displayedColumns.forEach((column) => {
            let newColumn = this._objectsGrid.header.columns.Add(column.name, column.title);
            newColumn.viewer = column.viewer || null;
            newColumn.editor = column.editor || null;
        });
        this._objectsGrid.header.columns.Add('controls-column-' + Date.Now().getTime(), '');
    }

    /**
     * Открыть окно с объектом
     * @param {Object|null} value //содержимое полей объекта/формы
     * @private
     */
    _openObjectWindow(value) {
        if (!this._objectWindow) {
            this._objectWindow = new Colibri.UI.Forms.ArrayGrid.ObjectWindow(this._name + '-object-window', document.body);
            this._objectWindow.parent = this;

            this._objectWindow.fields = this._fieldData.fields;
            this._objectWindow.title = this._fieldData.desc;
            this._objectWindow.stickyX = "center";
            this._objectWindow.stickyY = "center";
            this._objectWindow.root = this.root;

            if (this._fieldData.params?.window) { this._objectWindow.setParams(this._fieldData.params.window); }

            /** Добавить или обновить объект после отправки формы */
            this._objectWindow.AddHandler('FormSubmitted', (event, args) => {
                let newArgs = Object.assign({object_row: this._getSelected()}, args);
                this._objectWindow.containsNewObject ? this.__addObjectRow(event, newArgs) : this.__updateObjectRow(event, newArgs);

                this._objectsGrid.UnselectAllRows();
            });
            /** Обновить объект, когда содержимое формы изменилось */
            this._objectWindow.AddHandler('Changed', (event, args) => {
                if (!this._objectWindow.containsNewObject) {
                    this.__updateObjectRow(event, Object.assign({object_row: this._getSelected()}, args));
                }
            });
            /** Удалить окно из свойства, если оно было удалено из DOM */
            this._objectWindow.AddHandler('WindowClosed', (event, args) => {
                if (this._objectWindow.disposeOnClose) { this._objectWindow = null; }
            });
        }

        this._objectWindow.containsNewObject = !!!value;
        this._objectWindow.value = value || null;
        this._objectWindow.shown = true;
    }

    /**
     * Открыть окно с новым объектом
     * @param event
     * @param args
     * @private
     */
    __newObject(event, args) {
        this._openObjectWindow();
    }

    /**
     * Открыть окно с существующим объектом
     * @param event
     * @param args
     * @private
     */
    __showObject(event, args) {
        let row = this._getRow(args.object_row);
        if (row) { this._openObjectWindow(row.tag._objectValue || null); }
    }

    /**
     * Добавить строку с новым объектом
     * @param event
     * @param args
     * @private
     */
    __addObjectRow(event, args) {
        let value = this._objectWindow?.value || args.formValues || {};
        this._addRow(value);
    }

    /**
     * Обвновить строку с объектом
     * @param event
     * @param args
     * @private
     */
    __updateObjectRow(event, args) {
        let row = this._getRow(args.object_row);
        let value = this._objectWindow?.value || args.formValues || {};

        if (row) { row.value = row.tag._objectValue = value; }
    }

    /**
     * Удалить строку с объектом
     * @param event
     * @param args
     * @private
     */
    __removeObjectRow(event, args) {
        let row = this._getRow(args.object_row);
        if (row) { row.Dispose(); }
    }

    /**
     * Добавить строку
     * @param {Object} value
     * @private
     */
    _addRow(value) {
        let row = this._objectsGrid.rows.Add('row-' + Date.Now().getTime(), value || {});
        row.tag._objectValue = value;
    }

    /**
     * Показать контекстное меню строки
     * @param event
     * @param args
     * @private
     */
    __showContextMenu(event, args) {
        args.domEvent.preventDefault();
        args.domEvent.stopPropagation();

        let contextmenu = [
            {
                name: 'show-object',
                title: 'Редактировать',
                icon: Colibri.UI.ContextMenuEditIcon
            },
            {
                name: 'remove-object-row',
                title: 'Удалить',
                icon: Colibri.UI.ContextMenuRemoveIcon
            },
        ];

        args.item.contextmenu = contextmenu;
        args.item.ShowContextMenu(args.isContextMenuEvent ? 'right bottom' : 'left bottom', '', args.isContextMenuEvent ? {left: args.domEvent.clientX, top: args.domEvent.clientY} : null);
    }

    /**
     * Обработать клик по одному из пунктов контекстного меню
     * @param event
     * @param args
     * @private
     */
    __processContextMenuAction(event, args) {
        if (args?.menuData && args?.item) {
            switch (args.menuData.name) {
                case 'show-object':
                    this._objectsGrid.UnselectAllRows();
                    args.item.selected = true;

                    this.__showObject(event, Object.assign({object_row: args.item}, args));
                    break;

                case 'remove-object-row':
                    this.__removeObjectRow(event, Object.assign({object_row: args.item}, args));
                    break;
            }
        }
    }

    __toggleMassActionsMenu(event, args) {
        if (this._objectsGrid.checked.length > 1) {
            this._objectsGrid.massActionsMenu = [
                {
                    name: 'remove-object-rows',
                    title: 'удалить'
                }
            ];

            this._objectsGrid.ShowMassActionsMenu(document.body);
        } else {
            this._objectsGrid.massActionsMenu = null;
        }
    }

    __processMassAction(event, args) {
        if (args?.menuData && args?.items) {
            switch (args.menuData.name) {
                case 'remove-object-rows':
                    args.items.forEach((item) => {
                        this.__removeObjectRow(event, Object.assign({object_row: item}, args));
                    })
                    this._objectsGrid.massActionsMenu = null;
                    break;
            }
        }
    }

    /**
     * Выбранная строка грида
     * @return {Colibri.UI.Component[]}
     * @private
     */
    _getSelected() {
        return this._objectsGrid.selected;
    }

    /**
     * Получить строку по имени
     * @param {string|Colibri.UI.Grid.Row} value имя строки/объект строки
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
     * Список отображаемых колонок (если не указан, отображаются все)
     * @private
     */
    _setDisplayedColumns() {
        this._displayedColumns = [];
        let paramColumns = this._fieldData.params?.displayed_columns;

        Object.forEach(this._fieldData.fields, (fieldName, fieldData) => {
            if (paramColumns !== undefined && !(fieldName in paramColumns)) {
                return;
            }

            let column = {};
            column['name'] = fieldName;
            column['title'] = fieldData.desc || '';
            column['viewer'] = paramColumns ? (paramColumns[fieldName]?.viewer || null) : null;
            column['editor'] = paramColumns ? (paramColumns[fieldName]?.editor || null) : null;

            this._displayedColumns.push(column);
        });
    }

    /**
     * Фокус
     */
    Focus() {
        // do nothing
    }

    /**
     * Только для чтения
     */
    get readonly() {
        // do nothing
    }
    set readonly(value) {
        // do nothing
    }

    /**
     * Значение поля (все объекты)
     * @type {Object[]}
     */
    get value() {
        let data = [];
        this._objectsGrid.rows?.ForEach((name, row) => data.push(row.value));

        return data;
    }
    set value(value) {
        if(value && !Array.isArray(value)) { 
            throw new Error('Передайте массив'); 
        }

        this._objectsGrid.rows.Clear();
        value && value.forEach((item) => this._addRow(item));
    }

    /**
     * Поля объекта
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

    set tabIndex(value) {
        // do nothing
    }

    get tabIndex() {
        return this._objectsGrid.tabIndex;
    }

}


Colibri.UI.Forms.ArrayGrid.ObjectWindow = class extends Colibri.UI.ModelessWindow {
    constructor(name, container) {
         super(name, container);
         this.AddClass('app-component-array-grid-object-window');

         this._containsNewObject = true;

         this._form = new Colibri.UI.Forms.Form(this._name + '-form', this.container);
         this._saveButton = new Colibri.UI.SuccessButton(this._name + '-save-button', this.footer);
         this._saveButton.value = 'Сохранить';

         this._form.AddHandler('Changed', () => this.Dispatch('Changed', {formValues: this._form.value}));
         this._saveButton.AddHandler('Clicked', (event, args) => {
             this.Dispatch('FormSubmitted', {formValues: this._form.value});
             this.close();
         });

         this._form.shown = true;
         this._saveButton.shown = true;
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', 'Когда содержимое формы внутри окна изменилось');
        this.RegisterEvent('FormSubmitted', 'Когда форма внутри окна отправлена');
    }

    /**
     * Настройки окна
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
     * Форма с объектом
     * @return {Colibri.UI.Forms.Form}
     */
    get form() {
        return this._form;
    }

    /**
     * Поля формы
     * @return {Object}
     */
    get fields () {
        return this._form.fields;
    }
    /**
     * Поля формы
     * @param {string|Object} value
     */
    set fields(value) {
        this._form.fields = value;
    }

    /**
     * Значения полей формы
     * @type {Object|null}
     */
    get value() {
        return this._form.value;
    }
    set value(value) {
        this._form.value = value;
    }

    /**
     * Находится ли в форме новый объект
     * @type {boolean}
     */
    get containsNewObject() {
        return this._containsNewObject;
    }
    set containsNewObject(value) {
        this._containsNewObject = (value === true || value === 'true');
    }

    
    get root() {
        return this._form.root;
    }

    set root(value) {
        this._form.root = value;
    }

}