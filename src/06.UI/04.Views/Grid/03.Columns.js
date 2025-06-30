/**
 * Grid header coluumns component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Columns = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.create('tr'));
        this.AddClass('app-ui-header-columns');
        this.AddHandler('ChildAdded', this.__thisChildAdded);
        this._columnsAddedEventSent = false;
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisChildAdded(event, args) {
        args.component.AddHandler('ColumnStickyChange', this.__thisBubble, false, this);
        args.component.AddHandler('ColumnClicked', this.__thisBubble, false, this);
        args.component.AddHandler('ColumnDisposed', this.__thisBubble, false, this);
    }

    __newColumnMoved(event, args) {
        this.Dispatch('ColumnMoved', Object.assign(args, {column: newColumn}));
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnAdded', false, 'Поднимается, когда добавляется колонка');
        this.RegisterEvent('ColumnMoved', false, 'Поднимается, когда колонка передвинута');
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

        newColumn.AddHandler('ComponentMoved', this.__newColumnMoved, false, this);
        this.Dispatch('ColumnAdded', {column: newColumn});
        
        return newColumn;
    }

    Remove(name) {
        const col = this.Children(name);
        if(col) {
            col.Dispose();
        }
    }

    Column(name) {
        if(name === 'firstChild') {
            return this.Children(1);
        } 
        return this.Children(name);
    }

    get grid() {
        return this.parent.grid;
    }

    get count() {
        return this.children - 1;
    }

}