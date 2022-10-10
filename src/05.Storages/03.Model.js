Colibri.Storages.Models.Model = class extends Colibri.Events.Dispatcher {
    
    constructor(row, table) {
        super();
        this._row = row;
        this._table = table;
    }

    /**
     * Данные
     * @type {object}
     */
    get data() {
        return this._row;
    }
    /**
     * Данные
     * @type {object}
     */
    set data(value) {
        this._row = value;
    }

    /**
     * Сохранить строку
     * @returns Promise
     */
    Save() {
        return this._table.SaveRow(this);
    }

    /**
     * Удалить строку
     * @returns Promise
     */
    Delete() {
        return this._table.DeleteRow(this);
    }
}