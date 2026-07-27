/**
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Storages
 */
Colibri.Storages.Models.Model = class extends Colibri.Events.Dispatcher {
    
    /**
     * Constructs an instance of the Colibri.Storages.Models.Model class.
     * @param {object} row - The data row associated with this model.
     * @param {Colibri.Storages.Models.Table} table - The table to which this model belongs.
     * @constructor
     */
    constructor(row, table) {
        super();
        this._row = row;
        this._table = table;
    }

    /**
     * Gets the table to which this model belongs.
     * @type {Colibri.Storages.Models.Table}
     */
    get table() {
        return this._table;
    }
    
    /**
     * Gets the data row associated with this model.
     * @type {object}
     */
    get data() {
        return this._row;
    }
    /**
     * Sets the data row associated with this model.
     * @type {object}
     */
    set data(value) {
        this._row = value;
    }

    /**
     * Saves the current model by invoking the SaveRow method of the associated table.
     * @returns {Promise}
     */
    Save() {
        return this._table.SaveRow(this);
    }

    /**
     * Deletes the current model by invoking the DeleteRow method of the associated table.
     * @returns {Promise}
     */
    Delete() {
        return this._table.DeleteRow(this);
    }
}