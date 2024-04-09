/**
 * Grid rows group component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Rows = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('tbody'));

        this._tempCountRowsReportedCellsChange = 0;

        this._title = new Colibri.UI.Component('rows-title', this, Element.create('tr'));
        this._title.AddClass('app-ui-rows-group');
        this.__addButtonContainerForRowSelection();
        this._titleCell = new Colibri.UI.Component('rows-title-cell', this._title, Element.create('td'));
        this._titleCell.shown = true;
        this._titleCellSpan = new Colibri.UI.TextSpan('rows-title-span', this._titleCell);
        this._titleCellSpan.shown = true;
        this._titleCellCountSpan = new Colibri.UI.TextSpan('rows-title-rowscount-span', this._titleCell);
        this._titleCellCountSpan.shown = true;
        this._titleCellArrow = new Colibri.UI.Icon('rows-title-icon', this._titleCell);
        this._titleCellArrow.shown = true;
        this._titleCellArrow.value = Colibri.UI.DownArrowIcon;
        this.title = 'По умолчанию';
        this.columns = this.grid.header.columnsCount;

        this._titleCell.AddHandler('Clicked', (event, args) => {
            if(this._titleCellArrow.shown) {
                this.closed = !this.closed;
            }
        });

    }

    __addButtonContainerForRowSelection() {

        this._checkboxContainer = new Colibri.UI.Component('button-container-for-row-selection', this._title, Element.create('td'));
        this._checkboxContainer.AddClass('app-ui-row-cell');
        this._checkboxContainer.shown = this.grid.showCheckboxes;
        if (this.grid.showCheckboxes) {
            this._checkboxContainer.AddClass('input-checkbox-shown');
        }

        this._checkbox = new Colibri.UI.Checkbox('row-checkbox', this._checkboxContainer);
        this._checkbox.hasThirdState = true;
        this._checkbox.shown = true;

        this._checkbox.AddHandler('Changed', (event, args) => {
            this.ForEach((name, row) => {
                if(row.shown) {
                    row.checked = args.value;
                }
                else {
                    row.checked = false;
                }
            });    
            this.grid.header.checkbox.thirdState = this.grid.rowsCount > this.grid.checked.length;
            this.checkbox.thirdState = this.rowsCount > this.checked.length;
            this.grid.Dispatch('RowSelected');
        });

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('RowAdded', false, 'Поднимается, когда добавляется строка');
        this.RegisterEvent('RowUpdated', false, 'Поднимается, когда обновляется строка');
        this.RegisterEvent('RowStickyChange', false, 'Поднимается, когда строка меняет липкость');
        this.RegisterEvent('RowClicked', false, 'Поднимается, когда щелкнули по строке');
        this.RegisterEvent('CellClicked', false, 'Поднимается, когда щелкнули по ячейке');
        this.RegisterEvent('CellDoubleClicked', false, 'Поднимается, когда дважды щелкнули по ячейке');
        this.RegisterEvent('RowSelected', false, 'Поднимается, когда выбирают строку');
        this.RegisterEvent('RowDisposed', false, 'Поднимается, когда удалили строку');
        this.RegisterEvent('GridCellsChanged', false, 'Поднимается, когда все строки сообщили об изменении ячеек (sticky/dispose)');
        this.RegisterEvent('StickyChanged', false, 'Поднимается, когда все ячейки сообщили об изменинии sticky');
    }

    Add(name, value, index = null) {
        this.shown = true;
        let newRow = new Colibri.UI.Grid.Row(name, this);
        newRow.value = value;
        newRow.hasContextMenu = this.grid.hasContextMenu;

        // добавили, смотрим есть ли сортировка
        if(this.grid?.tag?.params?.sort) {
            const foundIndex = this.grid.tag.params.sort(newRow, this);
            this.Children(name, newRow, foundIndex);
        }
        else if(index) {
            this.Children(name, newRow, index);
        }

        this.Dispatch('RowAdded', {row: newRow});

        newRow.AddHandler('RowUpdated', (event, args) => {
            if(this.grid?.tag?.params?.sort) {
                const foundIndex = this.grid.tag.params.sort(newRow, this);
                this.Children(newRow.name, newRow, foundIndex);
            }
            this.Dispatch('RowUpdated', {row: args.row});
        });

        newRow.AddHandler('RowStickyChange', (event, args) => {
            this.Dispatch('RowStickyChange', args);
        });

        newRow.AddHandler('CellClicked', (event, args) => {
            this.Dispatch('CellClicked', args);
        });

        newRow.AddHandler('CellDoubleClicked', (event, args) => {
            this.Dispatch('CellDoubleClicked', args);
        });

        newRow.AddHandler('RowSelected', (event, args) => {
            if (this.grid.selectionMode === Colibri.UI.Grid.FullRow) {
                if (!this.grid.multiple) { 
                    this.grid.UnselectAllRows();
                }
                //args.row.selected = !args.row.selected;
                this.Dispatch('RowSelected', args);
            }
        });

        newRow.AddHandler('ComponentDisposed', (event, args) => {
            this.Dispatch('RowDisposed', {row: newRow});
        });

        newRow.AddHandler('CellHorizontalStickyChanged', (event, args) => {
            this._tempCountRowsReportedCellsChange = this._tempCountRowsReportedCellsChange + 1;
            if (this.rowsCount === this._tempCountRowsReportedCellsChange) {
                this._tempCountRowsReportedCellsChange = 0;
                this.Dispatch('GridCellsChanged', {rows: this});
            }
        });

        newRow.AddHandler('CellDisposed', (event, args) => {
            this._tempCountRowsReportedCellsChange = this._tempCountRowsReportedCellsChange + 1;
            if (this.rowsCount === this._tempCountRowsReportedCellsChange) {
                this._tempCountRowsReportedCellsChange = 0;
                this.Dispatch('GridCellsChanged', {rows: this});
            }
        });

        newRow.AddHandler('StickyChanged', (event, args) => {
            this.Dispatch('StickyChanged', args);
        });

        this._titleCellCountSpan.value = ' (' + this.rowsCount + ')';

        return newRow;
    }

    /**
     * @type {Boolean}
     * @readonly
     */
    get checkbox() {
        return this._checkbox;
    }

    /**
     * @type {Array}
     * @readonly
     */
    get selected() {
        let selectedRow = [];
        this.ForEach((nameRow, row) => {
            if(row instanceof Colibri.UI.Grid.Row) {
                row.selected ? selectedRow.push(row) : '';
            }
        });
        return selectedRow;
    }

    /**
     * @type {Boolean}
     * @readonly
     */
    get checked() {
        let checkedRows = [];
        this.ForEach((nameRow, row) => {
            if(row instanceof Colibri.UI.Grid.Row) {
                row.checked ? checkedRows.push(row) : '';
            }
        });
        return checkedRows;
    }

    /**
     * @type {Colibri.UI.Grid.Row}
     * @readonly
     */
    get activeRow() {
        let activeRow = null;
        this.ForEach((rowName, row) => {
            if (row.activated) {
                activeRow = row;
            }
        });
        return activeRow;
    }

    /**
     * @type {Colibri.UI.Grid}
     * @readonly
     */
    get grid() {
        return this.parent.parent;
    }

    /**
     * @type {Colibri.UI.Grid.Rows}
     * @readonly
     */
    get prevGroup() {
        if(this.prev instanceof Colibri.UI.Grid.Rows) {
            return this.prev;
        }
        return null;
    }

    /**
     * @type {Colibri.UI.Grid.Rows}
     * @readonly
     */
    get nextGroup() {
        if(this.next instanceof Colibri.UI.Grid.Rows) {
            return this.next;
        }
        return null;
    }

    /**
     * @type {Number}
     * @readonly
     */
    get rowsCount() {
        return this.children - 1;
    }

    /**
     * @type {Colibri.UI.Grid.Row}
     * @readonly
     */
    get firstRow() {
        return this.Children('firstChild').next;
    }

    /**
     * @type {Colibri.UI.Grid.Row}
     * @readonly
     */
    get lastRow() {
        return this.Children('lastChild');
    }

    /**
     * @type {String}
     */
    set title(value) {
        this._titleCellSpan.value = value;
        this._title.shown = !!value;
    }
    /**
     * @type {String}
     */
    get title() {
        return this._titleCellSpan.value; 
    }

    /**
     * @type {Colibri.UI.Component}
     */
    get titleCell() {
        return this._titleCell;
    }

    /**
     * @type {Number}
     */
    get columns() {
        return this._titleCell.container.attr('colspan');
    }
    /**
     * @type {Number}
     */
    set columns(count) {
        this._titleCell.container.attr('colspan', count);
    }

    /**
     * @type {Boolean}
     */
    get showCheckBoxes() {
        return this._title.Children('button-container-for-row-selection').shown;
    }
    /**
     * @type {Boolean}
     */ 
    set showCheckbox(value) {
        this._title.Children('button-container-for-row-selection').shown = value;
    }

    /**
     * @type {Boolean}
     */
    get closed() {
        return this.ContainsClass('-closed');
    }

    /**
     * @type {Boolean}
     */
    set closed(value) {
        if(value) {
            this.AddClass('-closed');
        }
        else {
            this.RemoveClass('-closed');
        }
    }

    Clear() {
        this.ForEach((name, component) => {
            if(component instanceof Colibri.UI.Grid.Row) {
                component.Dispose();
            }
        });
    }

    ForEveryRow(callback) {
        this.ForEach((rname, row, irow) => {
            if(row instanceof Colibri.UI.Grid.Row) {
                if(callback(rname, row, irow) === false) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Show/Hide title updown icon
     * @type {Boolean}
     */
    get titleIcon() {
        return this._titleCellArrow.shown;
    }
    /**
     * Show/Hide title updown icon
     * @type {Boolean}
     */
    set titleIcon(value) {
        this._titleCellArrow.shown = value;
    }

    /**
     * Show/Hide rowscount
     * @type {Boolean}
     */
    get showRowsCount() {
        return this._titleCellCountSpan.shown;
    }
    /**
     * Show/Hide rowscount
     * @type {Boolean}
     */
    set showRowsCount(value) {
        this._titleCellCountSpan.shown = value;
    }

    SortById(callback) {
        
        let list = [];
        this.ForEveryRow((name, row) => {
            list.push(row.value.id);
        });

        list = list.sort((a, b) => callback(a, b));
        let index = 0;
        for(const id of list) {
            const row = this.Children('data' + id);
            this.Children(row.name, row, index);
            index++;
        }
        

    }

    Update(value) {
        
        const existing = [];
        for(const item of value) {
            const exists = this.Children('data' + item.id);
            if(exists) {
                exists.value = item;
            } else {
                this.Add('data' + item.id, item);
            }
            existing.push(item.id);
        }

        this.ForEach((name, row) => {
            if(existing.indexOf(row.value.id) === -1) {
                row.Dispose();
            }
        });

    }

}