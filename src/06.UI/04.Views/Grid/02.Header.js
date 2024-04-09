
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

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnAdded', false, 'Поднимается, когда добавляется колонка');
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удалили колонку');
    }

    _handleEvents(columns, checkbox) {
        columns.AddHandler('ColumnAdded', (event, args) => {
            this.Dispatch('ColumnAdded', Object.assign(args, {columns: columns}));
        });

        columns.AddHandler('ColumnStickyChange', (event, args) => {
            this.Dispatch('ColumnStickyChange', Object.assign(args, {columns: columns}));
        });

        columns.AddHandler('ColumnClicked', (event, args) => {
            this.Dispatch('ColumnClicked', Object.assign(args, {columns: columns}));
        });

        columns.AddHandler('ColumnDisposed', (event, args) => {
            this.Dispatch('ColumnDisposed', Object.assign(args, {columns: columns}));
        });
        checkbox.AddHandler('Changed', (event, args) => {
            Object.forEach(this.grid.groups, (name, group) => {
                group.ForEach((name, row) => {
                    if(row.shown) {
                        row.checked = args.value;
                    }
                    else {
                        row.checked = false;
                    }
                });    
                group.checkbox.checked = args.value;
            });
            this.checkbox.thirdState = this.grid.rowsCount > this.grid.checked.length;
            Object.forEach(this.grid.groups, (name, group) => {
                group.checkbox.thirdState = group.rowsCount > group.checked.length;
            });
            this.grid.Dispatch('RowSelected');
        });
    }

    AddColumns(name) {
        const columns = new Colibri.UI.Grid.Columns(name, this);
        columns.AddClass('app-ui-header-columns');
        columns.shown = true;

        let columnSelectionButtons = columns.Add('button-container-for-row-selection', '');
        columnSelectionButtons.shown = this.grid.showCheckboxes;

        const checkbox = new Colibri.UI.Checkbox('row-checkbox', columnSelectionButtons);
        checkbox.hasThirdState = true;
        checkbox.shown = true;

        checkbox.AddHandler('ContextMenuItemClicked', (event, args) => {
            this.grid.Dispatch('RowsCheckboxContextMenuItemClicked', Object.assign(args, {rows: this, checkbox: this._checkbox})); 
        });
        checkbox.AddHandler('MouseDown', (event, args) => {
            this.grid.Dispatch('RowsCheckboxClicked', {rows: this, checkbox: this._checkbox, domEvent: args.domEvent}); 
        });


        this._handleEvents(columns, checkbox);
        return [columns, checkbox];
    }

    _addDefaultColumns() {
        const newColumns = this.AddColumns('app-ui-header-columns');
        this._columns = newColumns[0];
        this._checkbox = newColumns[1];
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
        return this._checkbox;
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
            if(columns.Children(colName)) {
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
                if(n != 'button-container-for-row-selection') {
                    ret[n] = col;
                }
            });
        });

        // we need to reorder list
        const hasIndexes = Array.sum(Object.values(ret).map(col => !!col.index ? 1 : 0)) > 0;
        if(!hasIndexes) {
            return ret;
        } else {
            let colArray = [];
            for(const col of Object.values(ret)) {
                if(!!col.index) {
                    colArray[parseInt(col.index)] = col;
                }
            }
            ret = {};
            colArray.sort();
            for(const col of colArray) {
                if(col) {
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
            if(name != 'button-container-for-row-selection') {
                count += parseInt(column.colspan ?? 1);
            }
        })
        return count;
    }


}