/**
 * Класс списка колонок
 */
Colibri.UI.Grid.Columns = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<tr />');
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnAdded', false, 'Поднимается, когда добавляется колонка');
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удалили колонку');
    }

    Add(name, title, attrs = {}) {
        let newColumn = new Colibri.UI.Grid.Column(name, this);
        newColumn.value = title;
        newColumn.shown = true;

        Object.forEach(attrs, (name, attr) => {
            newColumn[name] = attr;
        });

        this.Dispatch('ColumnAdded', {column: newColumn});

        newColumn.AddHandler('ColumnStickyChange', (event, args) => {
            this.Dispatch('ColumnStickyChange', args);
        });

        newColumn.AddHandler('ColumnClicked', (event, args) => {
            this.Dispatch('ColumnClicked', args);
        });

        newColumn.AddHandler('ColumnDisposed', (event, args) => {
            this.Dispatch('ColumnDisposed', args);
        });

        return newColumn;
    }

    get grid() {
        return this.parent.grid;
    }

    get count() {
        return this.children - 1;
    }
}