/**
 * Grid row component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Row = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('tr'));
        this.AddClass('app-ui-row');
        this.shown = this.parent.shown;

        this._templateElement = null;

        this._tempCountCellsReportedChange = 0;

        this._heightPrevStickyRow = this.header?.shown ? this.header.height : 0;

        this.sticky = false;
        this.activated = false;

        this._checkbox = null;
        this._checkboxContainer = null;
        this._addCheckboxContainer();
        this._createContextMenuButton();

        this._data = null;
        this._selected = false;

        this.draggable = this.grid?.draggable ?? false;
        this.dropable = this.grid?.dropable ?? false;

        if(container instanceof Colibri.UI.Component) {
            container.Dispatch('ChildAdded', { row: this });
        }


    }

    /**
     * Disposes component
     * @public
     */
    Dispose() {

        if (this._templateElement) {
            this._templateElement.remove();
        }

        this.grid?.UnregisterCheckbox(this._checkboxContainer);
        super.Dispose();
    }

    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('RowDoubleClicked', true, 'Поднимается, когда выбирают строку');        
        this.RegisterEvent('RowDisposed', true, 'Поднимается, когда выбирают строку');        
        this.RegisterEvent('RowSelected', true, 'Поднимается, когда выбирают строку');        
        this.RegisterEvent('RowCheckChanged', true, 'Поднимается, когда выбирают строку');        
        this.RegisterEvent('RowStickyChanged', true, 'Поднимается, когда все ячейки сообщили об изменинии sticky');

    }

    /**
     * @ignore
     * @private
     */
    _registerEventHandlers() {
        super._registerEventHandlers();
        
        this.AddHandler('ComponentDisposed', this.__thisComponentDisposed);
        this.AddHandler('ChildAdded', this.__thisChildAdded);
        this.AddHandler('ContextMenu', this.__thisContextMenu);
        this.AddHandler('DoubleClicked', this.__thisDoubleClicked);

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisDoubleClicked(event, args) {
        this.grid.Dispatch('RowDoubleClicked', Object.assign(args, {item: this}));
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisComponentDisposed(event, args) {
        this.Dispatch('RowDisposed', args);
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisChildAdded(event, args) {
        // if(args.cell) {
        //     args.cell.minWidth = args.cell.parentColumn.width;
        // }
        if(this._contextmenuContainer) {
            this.MoveChild(this._contextmenuContainer, this._contextmenuContainer.childIndex, this.children, false);
        }
    }

    /**
     * Perform column Add
     * @param {Colibri.UI.Grid.Column} column The column to be added.
     * @public
     */
    PerformColumnAdd(column) {
        this.Add(this.value, column);
    }

    /**
     * Perform column remove
     * @param {Colibri.UI.Grid.Column} column The column to be removed.
     * @public
     */
    PerformColumnRemove(column) {
        let cell = this.Children(this.name + '-' + column.name);
        if(cell) {
            cell.Dispose();
        }
    }

    /**
     * @ignore
     * @private
     */
    _addCheckboxContainer() {

        this._checkboxContainer = new Colibri.UI.Component('checkbox-column', this, Element.create('td'));
        this._checkboxContainer.AddClass('app-ui-row-cell');
        this._checkboxContainer.shown = false;

        this._checkbox = new Colibri.UI.Checkbox('checkbox', this._checkboxContainer);
        this._checkbox.shown = true;
        this._checkbox.AddHandler('Changed', this.__checkboxChanged, false, this);

    }

    /**
     * @ignore
     * @private
     */
    _createContextMenuButton() {
        this._contextmenuContainer = new Colibri.UI.Component('contextmenu-column', this, Element.create('td'));
        this._contextmenuContainer.AddClass('app-ui-row-cell');
        this._contextmenuContainer.shown = false;
        this._contextmenuContainer.width = 20;
        
        const contextMenuParent = new Colibri.UI.Component(this._name + '-contextmenu-icon-parent', this._contextmenuContainer);
        contextMenuParent.AddClass('app-contextmenu-icon-component');
        contextMenuParent.shown = true;

        const contextMenuIcon = new Colibri.UI.Icon(this._name + '-contextmenu-icon', contextMenuParent);
        contextMenuIcon.shown = true;
        contextMenuIcon.value = Colibri.UI.ContextMenuIcon;
        contextMenuIcon.AddHandler(['Clicked', 'DoubleClicked'], this.__contextMenuIconClickedOrDoubleClicked, false, this);
    }

    /**
     * @ignore
     * @private
     */
    _removeContextMenuButton() {
        if(this._hasContextMenu && this._contextmenuContainer.Children(this._name + '-contextmenu-icon-parent')) {
            this._contextmenuContainer.Children(this._name + '-contextmenu-icon-parent').Dispose();
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __contextMenuIconClickedOrDoubleClicked(event, args) {
        if(event.name === 'ContextMenu') {
            args.isContextMenuEvent = true;
        }

        this.grid.Dispatch('ContextMenuIconClicked', Object.assign(args, {item: this, row: this, cell: this.activeCell}));
        if(event.name === 'ContextMenu') {
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __checkboxChanged(event, args) {
        this.header.UpdateCheckedState();
        this.group.UpdateCheckedState();
        this.Dispatch('RowCheckChanged');
    }

    /**
     * @ignore
     * @private
     */
    _renderTemplateRow() {
        if (this.grid?.rowTemplateComponent) {

            if (this._templateElement) {
                this._templateElement.remove();
            }

            this._templateElement = Element.create('tr', { class: 'app-ui-row-template' });
            this._element.after(this._templateElement);
            
            this._templateElement.append(Element.create('td', { colspan: this.visibleCells, style: 'grid-column: span ' + this.visibleCells }))

            const comp = eval(this.grid?.rowTemplateComponent);
            const templateObject = new comp(this.name + '-template', this._templateElement.querySelector('td'));
            Object.forEach(this.grid?.rowTemplateAttrs ?? {}, (key, value) => {
                templateObject[key] = value;
            });
            templateObject.parent = this;
            templateObject.shown = true;
            templateObject.value = this._data;

        }
    }

    /**
     * Row index
     * @type {number}
     */
    set index(value) {
        this.parent.Children(this.name, this, value);
    }

    /**
     * Value object
     * @type {Object}
     */
    get value() {
        let ret = Object.assign({}, this._data);
        Object.forEach(this.header?.FindAllColumns(), (columnName, column) => {
            const cell = this.Children(this.name + '-' + column.name);
            if (cell) {
                ret[column.name] = cell.value;
            }
        });
        return ret;
    }

    /**
     * Value object
     * @type {Object}
     */
    set value(value) {
        this._data = Object.assign({}, value);
        Object.forEach(this.header?.FindAllColumns(), (columnName, column) => {
            this.Add(this._data, column);
        });
        this._renderTemplateRow();
        return this;
    }

    /**
     * Active cell
     * @type {Colibri.UI.Grid.Cell}
     */
    get activeCell() {
        let active = null;
        this.ForEach((cellName, cell) => {
            if (cell.activated) {
                active = cell;
                return false;
            }
            return true;
        });
        return active;
    }

    /**
     * First cell
     * @type {Colibri.UI.Grid.Cell}
     */
    get firstCell() {
        const firstCell = this.Children('firstChild');
        if (firstCell instanceof Colibri.UI.Grid.Cell) {
            return firstCell;
        }
        return null;
    }

    /**
     * Last cell
     * @type {Colibri.UI.Grid.Cell}
     */
    get lastCell() {
        const lastCell = this.Children('lastChild');
        if (lastCell instanceof Colibri.UI.Grid.Cell) {
            return lastCell;
        }
        return null;
    }

    /**
     * Prev row
     * @type {Colibri.UI.Grid.Row}
     */
    get prevRow() {
        if (this.prev instanceof Colibri.UI.Grid.Row) {
            return this.prev;
        }
        return null;
    }

    /**
     * Next row
     * @type {Colibri.UI.Grid.Row}
     */
    get nextRow() {
        if (this.next instanceof Colibri.UI.Grid.Row) {
            return this.next;
        }
        return null;
    }

    /**
     * Add the cell to the row
     * @param {Object} value The value to be added to the cell.
     * @param {Colibri.UI.Grid.Column} column The column associated with the cell.
     * @public
     */
    Add(value, column) {
        
        let val = '';
        try {
            val = column.name.indexOf('.') === -1 ? value[column.name] : eval(`value.${column.name}`);
        } catch (e) {
            // 
        }
        if (column.colspan && column.colspan > 1 && !val) {
            return null;
        }

        let newCell = this.Children(this.name + '-' + column.name);
        if (!newCell) {
            newCell = new Colibri.UI.Grid.Cell(this.name + '-' + column.name, this, column);    
        } else {
            newCell.parentColumn = column;
        }

        newCell.shown = column.shown;
        
        newCell.value = val;
        

    }

    /**
     * Has context menu
     * @type {Boolean}
     */
    get hasContextMenu() {
        return this._contextmenuContainer.shown;
    }
    /**
     * Has context menu
     * @type {Boolean}
     */
    set hasContextMenu(value) {
        value = this._convertProperty('Boolean', value);
        this._contextmenuContainer.shown = value;
        if(value) {
            this.AddHandler('ContextMenu', this.__contextMenuIconClickedOrDoubleClicked);
        } else {
            this.RemoveHandler('ContextMenu', this.__contextMenuIconClickedOrDoubleClicked);
        }
    }

    /**
     * Is row sticky
     * @type {Boolean}
     */
    get sticky() {
        return this._sticky;
    }
    /**
     * Is row sticky
     * @type {Boolean}
     */
    set sticky(value) {

        if (value) {
            this.AddClass('container-position-sticky-y');
        } else {
            this.RemoveClass('container-position-sticky-y');
        }

        const isChanged = this._sticky !== value; 
        this._sticky = value;

        if (this._checkboxContainer) {
            if (value) {
                this._checkboxContainer.AddClass('position-sticky-y');
            } else {
                this._checkboxContainer.RemoveClass('position-sticky-y');
            }
            this._checkboxContainer._stickyVertically = args.row.sticky;
        }

        if (isChanged) {
            this.Dispatch('RowStickyChanged', { row: this });
        }

    }
    /**
     * Is row selected
     * @type {Boolean}
     */
    get selected() {
        return this._selected;
    }
    /**
     * Is row selected
     * @type {Boolean}
     */
    set selected(value) {
        const isChanged = this._selected !== value;
        value ? this.AddClass('row-selected') : this.RemoveClass('row-selected');
        this._selected = value;
        if(isChanged) {
            this.Dispatch('RowSelected', {row: this});
        }
    }

    /**
     * Is row activated
     * @type {Boolean}
     */
    get activated() {
        return this._activated;
    }
    /**
     * Is row activated
     * @type {Boolean}
     */
    set activated(value) {
        if (value) {
            if (this.grid?.selectionMode === Colibri.UI.Grid.FullRow) {
                this.AddClass('row-active');
            }
        } else {
            if (this.grid?.selectionMode === Colibri.UI.Grid.FullRow) {
                this.RemoveClass('row-active');
            }
        }
        this._activated = value;
    }

    /**
     * Get the group of the row
     * @type {Colibri.UI.Grid.Rows}
     */
    get group() {
        return this.parent;
    }

    /**
     * Get the parent grid
     * @type {Colibri.UI.Grid.Rows}
     */
    get grid() {
        return this?.parent?.grid;
    }

    /**
     * Row header
     * @type {Colibri.UI.Grid.Header}
     */
    get header() {
        return this.grid?.header ?? null;
    }

    /**
     * Is row checked
     * @type {Boolean}
     */
    get checked() {
        return this._checkbox && this._checkbox.checked;
    }
    /**
     * Is row checked
     * @type {Boolean}
     */
    set checked(value) {
        this._checkbox && (this._checkbox.checked = value);
    }

    /**
     * Is row checkbox enabled
     * @type {Boolean}
     */
    get checkboxEnabled() {
        return this._checkbox && this._checkbox.enabled;
    }
    /**
     * Is row checkbox enabled
     * @type {Boolean}
     */
    set checkboxEnabled(value) {
        this._checkbox && (this._checkbox.enabled = value);
    }

    /**
     * Checkbox tooltip
     * @type {String}
     */
    get checkboxTooltip() {
        return this._checkbox ? this._checkbox.toolTip : null;
    }
    /**
     * Checkbox tooltip
     * @type {String}
     */
    set checkboxTooltip(value) {
        this._checkbox && (this._checkbox.toolTip = value);
    }

    /**
     * Is checkbox shown
     * @type {Boolean}
     */
    set checkbox(value) {
        this._checkboxContainer.shown = value;
    }
    /**
     * Is checkbox shown
     * @type {Boolean}
     */
    get checkbox() {
        return this._checkboxContainer.shown;
    }

    /**
     * Get the cell by column name
     * @param {string} columnName The name of the column associated with the cell.
     * @returns {Colibri.UI.Grid.Cell} The cell associated with the specified column name, or null if not found.
     * @public
     */
    Cell(columnName) {
        return this.Children(this.name + '-' + columnName);
    }

    /**
     * End edit process in all cells
     * @public
     */
    EndEdit() {
        this.ForEach((name, cell) => {
            cell.EndEdit && cell.EndEdit();
        })
    }

    /**
     * Show context menu
     * @param {Array} orientation The orientation of the context menu. It should be an array containing two values: the first value is the horizontal orientation (e.g., Colibri.UI.ContextMenu.RB for right-bottom), and the second value is the vertical orientation (e.g., Colibri.UI.ContextMenu.RT for right-top).
     * @param {string} className The CSS class name to be added to the context menu for styling purposes.
     * @param {Object} point The point where the context menu should be displayed. It should be an object with 'x' and 'y' properties representing the coordinates.
     * @public
     */
    ShowContextMenu(orientation = [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], className = '', point = null) {

        this._contextmenuContainer.Children('firstChild').AddClass('-selected');

        if (this._contextMenuObject) {
            this._contextMenuObject.Dispose();
            this._contextMenuObject = null;
        }

        this._contextMenuObject = new Colibri.UI.ContextMenu(this.name + '-contextmenu', document.body, orientation, point);
        this._contextMenuObject.Show(this.contextmenu, this._contextmenuContainer);
        if (className) {
            this._contextMenuObject.AddClass(className);
        }
        this._contextMenuObject.AddHandler('Clicked', this.__contextMenuObjectClicked, false, this);

    }

    /**
     * @ignore
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     * @private
     */
    __contextMenuObjectClicked(event, args) {
        
        this._contextmenuContainer.Children('firstChild')?.RemoveClass('-selected');
        this._contextMenuObject.Hide();
        this.grid.Dispatch('ContextMenuItemClicked', Object.assign(args, {item: this, row: this, cell: this.activeCell}));
        this._contextMenuObject.Dispose();
        this._contextMenuObject = null;
    }

    /**
     * @ignore
     * @private
     */
    _getContextMenuIcon() {
        if (this._contextmenuContainer.Children(this.lastCell.name + '-contextmenu-icon-parent')) {
            return this._contextmenuContainer.Children(this.lastCell.name + '-contextmenu-icon-parent/' + this.lastCell.name + '-contextmenu-icon');
        }
        return null;
    }

    /**
     * Get the cells count
     * @type {number}
     */
    get cells() {
        let count = 0;
        this.ForEach((name, cell) => cell instanceof Colibri.UI.Grid.Cell ? count++ : 0);
        return count;
    }

    /**
     * Returns all cells count, including hidden cells and special cells (like checkbox and context menu cells).
     * @type {number}
     */
    get allCells() {
        let cellsCount = this.Children().length;
        if(!this.hasContextMenu) {
            cellsCount--;
        }
        if(!this.checkbox) {
            cellsCount--;
        }
        return cellsCount;
    }

    /**
     * Returns visible cells count, excluding hidden cells and special cells (like checkbox and context menu cells).
     * @type {number}
     */
    get visibleCells() {
        let cellsCount = this.Children().filter(v => v.shown).length;
        if(!this.hasContextMenu) {
            cellsCount--;
        }
        if(!this.checkbox) {
            cellsCount--;
        }
        return cellsCount;

    }

    /**
     * Get the row template element
     * @type {Element}
     */
    SetRowTemplateSpan() {
        if(this._templateElement) {
            this._templateElement.querySelector('td').setAttribute('colspan', this.visibleCells);
            this._templateElement.querySelector('td').setAttribute('style', 'grid-column: span ' + this.visibleCells);
        }
    }

    /**
     * Collect the editors of the row
     * @returns {Array} An array of editor objects present in the row.
     * @public
     */
    CollectEditors() {
        let editors = [];
        this.ForEach((name, cell) => {
            if(cell.editor) {
                editors.push(cell.editorObject);
            }
        });
        return editors;
    }


}