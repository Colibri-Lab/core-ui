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
        this._createCheckboxContainer();
        
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

        this._titleCell.AddHandler('Clicked', this.__titleCellClicked, false, this);

    }

    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('RowAdded', false, 'When row added to group');

    }

    /**
     * @ignore
     * @private
     */
    _registerEventHandlers() {
        super._registerEventHandlers();

        this.AddHandler('Changed', this.__thisChanged);
        this.AddHandler('ChildAdded', this.__childAdded);

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __titleCellClicked(event, args) {
        if(this._titleCellArrow.shown) {
            this.closed = !this.closed;
        }
    }

    /**
     * @ignore
     * @private
     */
    _createCheckboxContainer() {

        this._checkboxContainer = new Colibri.UI.Component('checkbox-column', this._title, Element.create('td'));
        this._checkboxContainer.AddClass('app-ui-row-cell');
        this._checkboxContainer.shown = this.grid?.showCheckboxes ?? false;
        if (this.grid?.showCheckboxes) {
            this._checkboxContainer.AddClass('input-checkbox-shown');
        }

        this._checkbox = new Colibri.UI.Checkbox('checkbox', this._checkboxContainer);
        this._checkbox.hasThirdState = true;
        this._checkbox.shown = true;

        this._checkbox.AddHandler('Changed', this.__checkboxChanged, false, this);

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __checkboxChanged(event, args) {
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
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisChanged(event, args) {
        if(this.grid?.tag?.params?.sort) {
            const foundIndex = this.grid.tag.params.sort(event.sender, this);
            this.Children(newRow.name, event.sender, foundIndex);
        }
    }

    /**
     * Adds a new row to the grid row with the specified name and value. The new row will be added to the grid and will be visible by default.
     * @param {string} name The name of the new row to be added.
     * @param {*} value The value of the new row to be added.
     * @returns {Colibri.UI.Grid.Row} The newly created row.
     * @public
     */
    Add(name, value, index = null) {
        this.shown = true;
        let newRow = new Colibri.UI.Grid.Row(name, this);
        newRow.hasContextMenu = this.grid?.hasContextMenu ?? false;
        newRow.value = value;

        if(this.grid?.tag?.params?.sort) {
            const foundIndex = this.grid.tag.params.sort(newRow, this);
            this.Children(name, newRow, foundIndex);
        }
        else if(index) {
            this.Children(name, newRow, index);
        }

        if(value?.__selected === true) {
            this.grid.selected = newRow;
        }
        if(value?.__checked === true) {
            newRow.checked = true;
        }

        this.grid.Dispatch('RowAdded', {row: newRow});
        newRow.AddHandler('RowDisposed', this.__rowDisposed, false, this);

        return newRow;
    }

    /**
     * Update checked state
     * @returns {Colibri.UI.Grid.Checkbox}
     * @public
     */
    UpdateCheckedState() {
        this.checkbox.checked = this.checked.length > 0;
        this.checkbox.thirdState = this.rowsCount > this.checked.length;
                
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __rowDisposed(event, args) {
        if(this._titleCellCountSpan) {
            this._titleCellCountSpan.value = ' (' + this.rowsCount + ')';
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __childAdded(event, args) {
        if(this._titleCellCountSpan) {
            this._titleCellCountSpan.value = ' (' + this.rowsCount + ')';
        }
        args.row.checkbox = this.grid.showCheckboxes;
        args.row.hasContextMenu = this.grid.hasContextMenu;
    }

    /**
     * Checkbox of the rows group
     * @type {Colibri.UI.Checkbox}
     */
    get checkbox() {
        return this._checkbox;
    }

    /**
     * Selected rows
     * @type {Array<Colibri.UI.Grid.Row>}
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
     * Checked rows
     * @type {Array<Colibri.UI.Grid.Row>}
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
     * Active row
     * @type {Colibri.UI.Grid.Row}
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
     * Get grid
     * @type {Colibri.UI.Grid}
     */
    get grid() {
        return this?.parent?.parent;
    }

    /**
     * Get previous group
     * @type {Colibri.UI.Grid.Rows}
     */
    get prevGroup() {
        if(this.prev instanceof Colibri.UI.Grid.Rows) {
            return this.prev;
        }
        return null;
    }

    /**
     * Next group
     * @type {Colibri.UI.Grid.Rows}
     */
    get nextGroup() {
        if(this.next instanceof Colibri.UI.Grid.Rows) {
            return this.next;
        }
        return null;
    }

    /**
     * Rows count in group
     * @type {Number}
     */
    get rowsCount() {
        return this.children - 1;
    }

    /**
     * First row in group
     * @type {Colibri.UI.Grid.Row}
     */
    get firstRow() {
        return this.Children('firstChild').next;
    }

    /**
     * Last row in group
     * @type {Colibri.UI.Grid.Row}
     */
    get lastRow() {
        return this.Children('lastChild');
    }

    /**
     * Title of group
     * @type {String}
     */
    set title(value) {
        this._titleCellSpan.value = value;
        this._title.shown = !!value;
    }
    /**
     * Title of group
     * @type {String}
     */
    get title() {
        return this._titleCellSpan.value; 
    }

    /**
     * Title cell
     * @type {Colibri.UI.Component}
     */
    get titleCell() {
        return this._titleCell;
    }

    /**
     * Columns count
     * @type {Number}
     */
    get columns() {
        return this._titleCell.container.attr('colspan');
    }
    /**
     * Columns count
     * @type {Number}
     */
    set columns(count) {
        this._titleCell.container.attr('colspan', count);
    }

    /**
     * Is show checkboxes
     * @type {Boolean}
     */
    get showCheckBoxes() {
        return this._title.Children('checkbox-column').shown;
    }
    /**
     * Is show checkboxes
     * @type {Boolean}
     */ 
    set showCheckbox(value) {
        this._title.Children('checkbox-column').shown = value;
    }

    /**
     * Is group closed
     * @type {Boolean}
     */
    get closed() {
        return this.ContainsClass('-closed');
    }

    /**
     * Is group closed
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

    /**
     * Clear all rows in group
     * @public
     */
    Clear() {

        const collected = [];
        for(const row of this._children) {
            if(row instanceof Colibri.UI.Grid.Row) {
                collected.push(row); 
            }
        }      

        while(collected.length > 0) {
            collected[0].Dispose();
            collected.shift();
        }

    }

    /**
     * Iterates over every row in the group and executes the provided callback function for each row. The callback function receives the name of the row and the row object itself as parameters. If the callback function returns false, the iteration will stop.
     * @param {Function} callback Callback function to be executed for each row in the group. The callback function should accept two parameters: the name of the row and the row object itself. If the callback function returns false, the iteration will stop.
     * @public
     */
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

    /**
     * Sort the rows by id
     * @param {Function} callback Callback function to determine the sort order. The callback function should accept two parameters: the id of the first row and the id of the second row. It should return a negative value if the first row should come before the second, a positive value if the first row should come after the second, or zero if they are equal.
     * @public
     */
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

    /**
     * Update the rows in the group based on the provided array of values. If a row with the same id already exists, its value will be updated. If a row with a new id is provided, it will be added to the group. Any existing rows that are not present in the new array will be removed from the group.
     * @param {Array} value An array of values to update the rows in the group. Each value should have an 'id' property to identify the row.
     * @public
     */
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
            if(row instanceof Colibri.UI.Grid.Row) {
                if(existing.indexOf(row.value.id) === -1) {
                    row.Dispose();
                }
            }
        });

    }

    /**
     * Values array
     * @type {Array}
     */
    set value(value) {

        if(!value) {
            value = [];
        }

        if(Object.isObject(value)) {
            value = Object.values(value);
        }

        this.Clear()
        value.forEach((d) => {
            this.Add('data' + (d.id ?? Date.Mc()), d);
        });

    }

    /**
     * Values array
     * @type {Array}
     */
    get value() {
        const ret = [];
        this.ForEveryRow((name, row) => {
            ret.push(row.value);
        });
        return ret;
    }


    /**
     * Show checkboxes on rows
     * @type {Boolean}
     */
    get showCheckboxes() {
        return this._showCheckboxes;
    }
    /**
     * Show checkboxes on rows
     * @type {Boolean}
     */
    set showCheckboxes(value) {
        this._showCheckboxes = value;
        this._showShowCheckboxes();
    }
    /**
     * @ignore
     * @private
     */
    _showShowCheckboxes() {
        
        this.ForEveryRow((n, row) => {
            row.checkbox = true;
        });

    }

    /**
     * @ignore
     * @private
     */
    _createContextMenuButton() {
        // do nothing
    }

    /**
     * @ignore
     * @private
     */
    _removeContextMenuButton() {
        // do nothing
    }

    /**
     * @ignore
     * @private
     */
    _getContextMenuIcon() {
        return null;
    }
    
}