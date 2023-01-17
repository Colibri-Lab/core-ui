
/**
 * Класс заголовка таблицы
 */
Colibri.UI.Grid.Header = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<thead />');

        this._sticky = true;
        this._grid = this.parent.parent;

        this._columns = new Colibri.UI.Grid.Columns('app-ui-header-columns', this);
        this._columns.AddClass('app-ui-header-columns');
        this._columns.shown = true;

        let columnSelectionButtons = this.columns.Add('button-container-for-row-selection', '');
        columnSelectionButtons.shown = this.grid.showCheckboxes;

        this._checkbox = new Colibri.UI.Checkbox('row-checkbox', columnSelectionButtons);
        this._checkbox.hasThirdState = true;
        this._checkbox.shown = true;

        this._handleEvents();
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnAdded', false, 'Поднимается, когда добавляется колонка');
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удалили колонку');
    }

    _handleEvents() {
        this._columns.AddHandler('ColumnAdded', (event, args) => {
            this.Dispatch('ColumnAdded', args);
        });

        this._columns.AddHandler('ColumnStickyChange', (event, args) => {
            this.Dispatch('ColumnStickyChange', args);
        });

        this._columns.AddHandler('ColumnClicked', (event, args) => {
            this.Dispatch('ColumnClicked', args);
        });

        this._columns.AddHandler('ColumnDisposed', (event, args) => {
            this.Dispatch('ColumnDisposed', args);
        });
        this._checkbox.AddHandler('Changed', (event, args) => {
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



}