
/**
 * Grid header component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Header = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('thead'));

        this._sticky = true;
        this._grid = this.parent.parent;

        this._addDefaultColumns();

    }

    /**
     * Updates the checked state of the checkbox column based on the number of checked 
     * rows in the grid. If there are any checked rows, the checkbox will be checked. 
     * If all rows are checked, the checkbox will be in a third state (indeterminate).
     * @public
     */
    UpdateCheckedState() {
        this.columns.checkbox.checked = this.grid?.checked.length > 0;
        this.columns.checkbox.thirdState = this.grid?.rowsCount > this.grid?.checked.length;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __checkboxContextMenuItemClicked(event, args) {
        this.grid.Dispatch('RowsCheckboxContextMenuItemClicked', Object.assign(args, { rows: this, checkbox: this._checkbox }));
    }
    
    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __checkboxMouseDown(event, args) {
        this.grid.Dispatch('RowsCheckboxClicked', { rows: this, checkbox: this._checkbox, domEvent: args.domEvent });
    }

    /**
     * @ignore
     * @private
     */
    _handleEvents(columns, checkbox) {

        checkbox.AddHandler('ContextMenuItemClicked', this.__checkboxContextMenuItemClicked, false, this);
        checkbox.AddHandler('MouseDown', this.__checkboxMouseDown, false, this);

    }

    /**
     * Adds a new set of columns to the grid header with the specified name. The new columns will be added to the header and will be visible by default.
     * @param {string} name The name of the new set of columns to be added.
     * @returns {Colibri.UI.Grid.Columns} The newly created set of columns.
     * @public
     */
    AddColumns(name) {
        const columns = new Colibri.UI.Grid.Columns(name, this, false);
        columns.AddClass('app-ui-header-columns');
        columns.shown = true;
        this._columns.checkboxContainer && (this._columns.checkboxContainer.rowspan = this.children);
        this._columns.contextmenuContainer && (this._columns.contextmenuContainer.rowspan = this.children);
        return columns;
    }
    
    /**
     * @ignore
     * @private
     */
    _addDefaultColumns() {
        this._columns = new Colibri.UI.Grid.Columns(name, this, true);
        this._columns.AddClass('app-ui-header-columns');
        this._columns.shown = true;
    }

    /**
     * Resets the grid header by clearing all existing columns and adding the default columns back. This method is useful when you want to start fresh with the grid header and remove any customizations or changes made to the columns.
     * @public
     */
    Reset() {
        this.Clear();
        this._addDefaultColumns();
    }

    /**
     * Gets checkbox
     * @type {Boolean}
     */
    get checkbox() {
        return this.columns.checkbox;
    }

    /**
     * Get columns
     * @type {Colibri.UI.Grid.Columns}
     */
    get columns() {
        return this._columns;
    }

    /**
     * Get grid
     * @type {Colibri.UI.Grid}
     */
    get grid() {
        return this._grid;
    }

    /**
     * Is sticky
     * @type {Boolean}
     */
    get sticky() {
        return this._sticky;
    }

    /**
     * Find the column by name
     * @param {string} colName The name of the column to find.
     * @public
     */
    FindColumn(colName) {
        let found = null;
        this.ForEach((name, columns) => {
            if (columns.Children(colName)) {
                found = columns.Children(colName);
                return false;
            }
        });
        return found;
    }

    /**
     * Finds all columns in the grid header that have a specified width. This method iterates through all columns and checks if they have a defined width. 
     * It excludes certain special columns like 'checkbox-column' and 'contextmenu-column' from the search. 
     * The method returns an array of columns that meet the criteria.
     * @returns {Array} An array of columns that have a specified width.
     * @public
     */
    FindColumnsWithWidth() {
        let ret = [];
        this.ForEach((name, columns) => {
            columns.ForEach((n, col) => {
                if (n != 'checkbox-column' && n != 'contextmenu-column' && (col?.colspan || 1) == 1) {
                    ret.push(col);
                }
            });
        });
        return ret;
    }

    /**
     * Finds all columns in the grid header, excluding special columns like 'checkbox-column' and 'contextmenu-column'.
     * The method returns an object where the keys are the column names and the values are the corresponding column objects.
     * If any of the columns have an 'index' property, the returned object will be reordered based on these indexes.
     * @returns {Object} An object containing all columns in the grid header, excluding special columns.
     * @public
     */
    FindAllColumns() {

        let ret = {};
        this.ForEach((name, columns) => {
            columns.ForEach((n, col) => {
                if (n != 'checkbox-column' && n != 'contextmenu-column') {
                    ret[n] = col;
                }
            });
        });

        // we need to reorder list
        const hasIndexes = Array.sum(Object.values(ret).map(col => !!col.index ? 1 : 0)) > 0;
        if (!hasIndexes) {
            return ret;
        } else {
            let colArray = [];
            for (const col of Object.values(ret)) {
                if (!!col.index) {
                    colArray[parseInt(col.index)] = col;
                }
            }
            ret = {};
            colArray.sort();
            for (const col of colArray) {
                if (col) {
                    ret[col.name] = col;
                }
            }
        }
        return ret;
    }

    /**
     * Columns count
     * @type {Number}
     */
    get columnsCount() {
        let count = 0;
        this._columns.ForEach((name, column) => {
            if (name != 'checkbox-column' && name != 'contextmenu-column') {
                count += parseInt(column.colspan ?? 1);
            }
        })
        return count;
    }

    /**
     * Has context menu
     * @type {Boolean}
     */
    get hasContextMenu() {
        return this._hasContextMenu;
    }
    /**
     * Has context menu
     * @type {Boolean}
     */
    set hasContextMenu(value) {
        this._hasContextMenu = value;
        this._columns.hasContextMenu = value;
    }


}