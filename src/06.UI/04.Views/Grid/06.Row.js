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

        this.countCells = 0;
        this._tempCountCellsReportedChange = 0;

        this._heightPrevStickyRow = this.header?.shown ? this.header.height : 0;

        this.sticky = false;
        this.activated = false;

        this._checkbox = null;
        this._checkboxContainer = null;
        this.__addButtonContainerForRowSelection();

        this._handleEvents();

        this._data = null;

        this.draggable = this.grid?.draggable ?? false;
        this.dropable = this.grid?.dropable ?? false;


    }

    __thisComponentDisposed(event, args) {
        if (this._templateElement) {
            this._templateElement.remove();
        }
    }

    __columnAdded(event, args) {
        this.__newCell('', args.column);
    }

    Dispose() {
        if (!this?.grid) {
            return;
        }
        this?.grid?._rowSelectionCheckbox.delete(this._checkboxContainer);
        super.Dispose();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('RowStickyChange', false, 'Поднимается, когда строка меняет липкость');
        this.RegisterEvent('CellClicked', false, 'Поднимается, когда щелкнули по ячейке');
        this.RegisterEvent('CellDoubleClicked', false, 'Поднимается, когда дважды щелкнули по ячейке');
        this.RegisterEvent('RowSelected', false, 'Поднимается, когда выбирают строку');
        this.RegisterEvent('RowClicked', false, 'Поднимается, когда кликнули по строке');
        this.RegisterEvent('RowUpdated', false, 'Поднимается, когда обновили данные строки');
        this.RegisterEvent('CellHorizontalStickyChanged', false, 'Поднимается, когда ячейка меняет sticky по горизонтали');
        this.RegisterEvent('StickyChanged', false, 'Поднимается, когда все ячейки сообщили об изменинии sticky');
        this.RegisterEvent('CellDisposed', false, 'Поднимается, когда удалили ячейку');
        this.RegisterEvent('RowPositionChange', false, 'Поднимается, когда меняется положение липкости');
    }

    __thisRowStickyChange(event, args) {
        if (!this._checkboxContainer) {
            return true;
        }

        if (args.row.sticky) {
            this._checkboxContainer.AddClass('position-sticky-y');
        } else {
            this._checkboxContainer.RemoveClass('position-sticky-y');
        }
        this._checkboxContainer._stickyVertically = args.row.sticky;
    }

    __thisRowPositionChange(event, args) {
        if (!this._checkboxContainer) {
            return true;
        }

        if (this._checkboxContainer._stickyVertically) {
            this._checkboxContainer._element.css('top', args.row._positionTop + 'px');
        }
    }

    _handleEvents() {

        this.AddHandler('RowStickyChange', this.__thisRowStickyChange);
        this.AddHandler('RowPositionChange', this.__thisRowPositionChange);

        this.AddHandler('ContextMenuIconClicked', (event, args) => event.sender.grid?.Dispatch('ContextMenuIconClicked', Object.assign({ item: event.sender }, args)));
        this.AddHandler('ContextMenuItemClicked', (event, args) => event.sender.grid?.Dispatch('ContextMenuItemClicked', Object.assign({ item: event.sender }, args)));

        this.AddHandler('ComponentDisposed', this.__thisComponentDisposed);
        this.AddHandler('ColumnAdded', this.__columnAdded);

    }

    __addButtonContainerForRowSelection() {

        this._checkboxContainer = new Colibri.UI.Component('button-container-for-row-selection', this, Element.create('td'));
        this._checkboxContainer.AddClass('app-ui-row-cell');
        this._checkboxContainer.shown = this.grid?.showCheckboxes ?? false;
        if (this.grid?.showCheckboxes) {
            this._checkboxContainer.AddClass('input-checkbox-shown');
        }
        this.grid?._rowSelectionCheckbox.add(this._checkboxContainer);

        this._checkbox = new Colibri.UI.Checkbox('row-checkbox', this._checkboxContainer);
        this._checkbox.shown = true;

        this._checkbox.AddHandler('Changed', this.__checkboxChanged, false, this);

    }

    __checkboxChanged(event, args) {
        this.Dispatch('RowSelected', { row: this });

        this.header && (this.header.checkbox.thirdState = this.grid?.rowsCount > this.grid?.checked.length);
        this.group.checkbox.thirdState = this.group.rowsCount > this.group.checked.length;
    }

    _renderTemplateRow() {
        if (this.grid?.rowTemplateComponent) {

            if (this._templateElement) {
                this._templateElement.remove();
            }

            this._templateElement = Element.create('tr', { class: 'app-ui-row-template' });
            this._element.after(this._templateElement);
            this._templateElement.append(Element.create('td', { colspan: this._element.children.length - (this.grid?.showCheckboxes ? 0 : 1) }))

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

    set index(value) {
        this.parent.Children(this.name, this, value);
    }

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

    set value(value) {
        this._data = Object.assign({}, value);
        Object.forEach(this.header?.FindAllColumns(), (columnName, column) => {
            this.__newCell(this._data, column);
        });
        this._renderTemplateRow();
        this.Dispatch('RowUpdated', { row: this });
        return this;
    }

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

    get firstCell() {
        const firstCell = this.Children('firstChild');
        if (firstCell instanceof Colibri.UI.Grid.Cell) {
            return firstCell;
        }
        return null;
    }

    get lastCell() {
        const lastCell = this.Children('lastChild');
        if (lastCell instanceof Colibri.UI.Grid.Cell) {
            return lastCell;
        }
        return null;
    }

    get prevRow() {
        if (this.prev instanceof Colibri.UI.Grid.Row) {
            return this.prev;
        }
        return null;
    }

    get nextRow() {
        if (this.next instanceof Colibri.UI.Grid.Row) {
            return this.next;
        }
        return null;
    }

    __newCellCellDoubleClicked(event, args) {
        this.Dispatch('CellDoubleClicked', args);
    }

    __newCellCellHorizontalStickyChanged(event, args) {
        this.Dispatch('CellHorizontalStickyChanged', args);
    }

    __newCellCellVerticalStickyChanged(event, args) {
        this._tempCountCellsReportedChange = this._tempCountCellsReportedChange + 1;
        if (this.countCells === this._tempCountCellsReportedChange) {
            this._tempCountCellsReportedChange = 0;
            this.Dispatch('StickyChanged', { row: this });
        }
    }

    __newCell(value, column) {

        let val = '';
        try {
            val = column.name.indexOf('.') === -1 ? value[column.name] : eval(`value.${column.name}`);
        } catch (e) {
            // 
        }
        if (column.colspan && column.colspan > 1 && !val) {
            return null;
        }

        this.countCells = this.countCells + 1;

        let newCell = this.Children(this.name + '-' + column.name);
        if (!newCell) {

            if (this.hasContextMenu) {
                this._removeContextMenuButton();
            }

            newCell = new Colibri.UI.Grid.Cell(this.name + '-' + column.name, this);
            newCell.parentColumn = column;
            newCell.shown = true;
            if (!column.shown) {
                newCell.shown = false;
            }

            newCell.AddHandler('CellDoubleClicked', this.__newCellCellDoubleClicked, false, this);
            newCell.AddHandler('CellHorizontalStickyChanged', this.__newCellCellHorizontalStickyChanged, false, this);
            newCell.AddHandler('CellVerticalStickyChanged', this.__newCellCellVerticalStickyChanged, false, this);
            newCell.AddHandler('CellDisposed', this.__thisBubble, false, this);
        }

        newCell.value = val;

        if (this.hasContextMenu) {
            this._createContextMenuButton();
        }

    }

    get sticky() {
        return this._sticky;
    }

    set sticky(value) {
        if (value) {
            this.AddClass('container-position-sticky-y');
        } else {
            this.RemoveClass('container-position-sticky-y');
        }

        if (this._sticky !== value) {
            this._sticky = value;
            this.Dispatch('RowStickyChange', { row: this });
        }

    }

    get selected() {
        return this._selected;
    }

    set selected(value) {
        value ? this.AddClass('row-selected') : this.RemoveClass('row-selected');
        this._selected = value;
    }

    get activated() {
        return this._activated;
    }

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

    get group() {
        return this.parent;
    }

    get grid() {
        return this?.parent?.parent?.parent;
    }

    get header() {
        return this.grid?.header ?? null;
    }

    get countCells() {
        return this._countCells;
    }

    set countCells(value) {
        this._countCells = value;
    }

    get checked() {
        return this._checkbox && this._checkbox.checked;
    }
    set checked(value) {
        this._checkbox && (this._checkbox.checked = value);
    }

    get checkboxEnabled() {
        return this._checkbox && this._checkbox.enabled;
    }
    set checkboxEnabled(value) {
        this._checkbox && (this._checkbox.enabled = value);
    }

    set checkboxTooltip(value) {
        this._checkbox && (this._checkbox.toolTip = value);
    }

    Cell(columnName) {
        return this.Children(this.name + '-' + columnName);
    }

    _createContextMenuButton() {
        this.lastCell && this.lastCell.CreateContextMenuButton();
        this.AddClass('app-component-hascontextmenu');
    }

    _removeContextMenuButton() {
        this.lastCell && this.lastCell.RemoveContextMenuButton();
        this.RemoveClass('app-component-hascontextmenu');
    }

    EndEdit() {
        this.ForEach((name, cell) => {
            cell.EndEdit && cell.EndEdit();
        })
    }


    ShowContextMenu(orientation = [Colibri.UI.ContextMenu.RT, Colibri.UI.ContextMenu.RB], className = '', point = null) {
        const cell = this.Children('lastChild');

        cell.Children(cell.name + '-contextmenu-icon-parent').AddClass('-selected');

        if (this._contextMenuObject) {
            this._contextMenuObject.Dispose();
            this._contextMenuObject = null;
        }

        this._contextMenuObject = new Colibri.UI.ContextMenu(cell.name + '-contextmenu', document.body, orientation, point);
        this._contextMenuObject.Show(this.contextmenu, cell);
        if (className) {
            this._contextMenuObject.AddClass(className);
        }
        this._contextMenuObject.AddHandler('Clicked', this.__contextMenuObjectClicked, false, this);

    }

    __contextMenuObjectClicked(event, args) {
        
        const cell = this.Children('lastChild');
        cell.Children(cell.name + '-contextmenu-icon-parent')?.RemoveClass('-selected');

        this._contextMenuObject.Hide();
        this.Dispatch('ContextMenuItemClicked', args);
        this._contextMenuObject.Dispose();
        this._contextMenuObject = null;
    }


    _getContextMenuIcon() {
        if (this.lastCell.Children(this.lastCell.name + '-contextmenu-icon-parent')) {
            return this.lastCell.Children(this.lastCell.name + '-contextmenu-icon-parent/' + this.lastCell.name + '-contextmenu-icon');
        }
        return null;
    }


}