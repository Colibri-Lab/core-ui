
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


    __checkboxContextMenuItemClicked(event, args) {
        this.grid.Dispatch('RowsCheckboxContextMenuItemClicked', Object.assign(args, { rows: this, checkbox: this._checkbox }));
    }
    
    __checkboxMouseDown(event, args) {
        this.grid.Dispatch('RowsCheckboxClicked', { rows: this, checkbox: this._checkbox, domEvent: args.domEvent });
    }

    _handleEvents(columns, checkbox) {

        checkbox.AddHandler('ContextMenuItemClicked', this.__checkboxContextMenuItemClicked, false, this);
        checkbox.AddHandler('MouseDown', this.__checkboxMouseDown, false, this);

    }

    AddColumns(name) {
        const columns = new Colibri.UI.Grid.Columns(name, this, false);
        columns.AddClass('app-ui-header-columns');
        columns.shown = true;
        this._columns.checkboxContainer && (this._columns.checkboxContainer.rowspan = this.children);
        this._columns.contextmenuContainer && (this._columns.contextmenuContainer.rowspan = this.children);
        return columns;
    }
    
    _addDefaultColumns() {
        this._columns = new Colibri.UI.Grid.Columns(name, this, true);
        this._columns.AddClass('app-ui-header-columns');
        this._columns.shown = true;
    }

    Reset() {
        this.Clear();
        this._addDefaultColumns();
    }

    /**
     * Gets checkbox
     * @type {Boolean}
     * @readonly
     */
    get checkbox() {
        return this.columns.checkbox;
    }

    get columns() {
        return this._columns;
    }

    get grid() {
        return this._grid;
    }

    get sticky() {
        return this._sticky;
    }

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
     * @type {Number}
     * @readonly
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
     * 
     * @type {}
     */
    get hasContextMenu() {
        return this._hasContextMenu;
    }
    /**
     * 
     * @type {}
     */
    set hasContextMenu(value) {
        this._hasContextMenu = value;
        this._columns.hasContextMenu = value;
    }


}