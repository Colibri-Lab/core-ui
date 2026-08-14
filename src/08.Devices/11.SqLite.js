
/**
 * Represents a utility for accessing sim information.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.SqLite = class extends Destructable {

    /**
     * Instance variable representing the device.
     * @type {Colibri.UI.Device}
     * @private
     */
    _device = null;

    /**
     * Instance variable representing the plugin.
     * @type {null}
     * @private
     */
    _plugin = null;

    /**
     * Creates an instance of GeoLocation.
     * @constructor
     * @param {Colibri.Devices.Device} device - The device object.
     */
    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('sqlitePlugin');

    }

    /**
     * Checks if the SQLite plugin is available.
     * @type {boolean} - True if the plugin is available, false otherwise.
     */
    get isAvailable() {
        return !!this._plugin;
    }

    /**
     * Opens a SQLite database with the given name and location.
     * @param {string} name - The name of the database.
     * @param {string} [location='default'] - The location of the database.
     * @returns {Promise} - Promise resolving to the opened database object.
     * @public
     */
    Open(name, location = 'default') {
        return this._plugin.openDatabase({
            name,
            location
        });
    }

    /**
     * Executes a SQL query on the given database with optional parameters.
     * @param {object} db - The database object.
     * @param {string} query - The SQL query to execute.
     * @param {Array} [params=[]] - Optional parameters for the query.
     * @returns {Promise} - Promise resolving to the query results.
     * @async
     * @public
     */
    Query(db, query, params = []) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                tx.executeSql(query, params, function(tx, results) {
                    const data = [];
                    for(let i = 0; i < results.rows.length; i++) {
                        data.push(results.rows.item(i));
                    }
                    resolve(data);
                }, function(error) {
                    reject(error);
                });
            }, function(error) {
                reject(error);
            }, function() {
                resolve([]);
            });
        });
    }

    /**
     * Creates a table in the given database with specified fields and optional rows.
     * @param {object} db - The database object.
     * @param {string} name - The name of the table to create.
     * @param {Array} fields - An array of field definitions for the table.
     * @param {Array} [rows=[]] - Optional array of rows to insert into the table after creation.
     * @returns {Promise} - Promise resolving when the table is created and rows are inserted.
     * @async
     * @public
     */
    CreateTable(db, name, fields, rows = []) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {

                const sqlCreate = 'CREATE TABLE IF NOT EXISTS ' + name + '(' + fields.join(',') + ')';
                tx.executeSql(sqlCreate);

                if(rows.length > 0) {
                    for(let i = 0; i < rows.length; i++) {
                        const row = rows[i];

                        const sqlInsert = 'INSERT INTO ' + name + '("' + Object.keys(row).join('","') + '") VALUES (' + Array.enumerate(0, Object.keys(row).length - 1, (i) => '?') + ')';
                        tx.executeSql(sqlInsert, Object.values(row).map(v => {
                            if(!(v instanceof Date) && (Object.isObject(v) || Array.isArray(v))) {
                                return JSON.stringify(v);
                            } else if((v + '').isDate()) {
                                return new Date(v).toUnixTime();
                            } else if(v === true || v === false) {
                                return v ? 1 : 0;
                            }
                            return v;
                        }));

                    }
                }
            }, function(error) {
                reject(error);
            }, function() {
                resolve();
            });
        });
    }

    /**
     * Inserts rows into a table in the given database.
     * @param {object} db - The database object.
     * @param {string} name - The name of the table to insert rows into.
     * @param {Array} rows - An array of row objects to insert into the table.
     * @returns {Promise} - Promise resolving when the rows are inserted.
     * @async
     * @public
     */
    Insert(db, name, rows = []) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                if(rows.length > 0) {
                    for(let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const sqlInsert = 'INSERT INTO ' + name + '("' + Object.keys(row).join('","') + '") VALUES (' + Array.enumerate(0, Object.keys(row).length - 1, (i) => '?') + ')';
                        tx.executeSql(sqlInsert, Object.values(row).map(v => {
                            if(!(v instanceof Date) && (Object.isObject(v) || Array.isArray(v))) {
                                return JSON.stringify(v);
                            } else if((v + '').isDate()) {
                                return new Date(v).toUnixTime();
                            } else if(v === true || v === false) {
                                return v ? 1 : 0;
                            }
                            return v;
                        }));
                    }
                }
            }, function(error) {
                reject(error);
            }, function() {
                resolve();
            });
        });
    }

    /**
     * Updates rows in a table in the given database based on their IDs.
     * @param {object} db - The database object.
     * @param {string} name - The name of the table to update rows in.
     * @param {Array} rows - An array of row objects to update in the table. Each row must have an 'id' property.
     * @returns {Promise} - Promise resolving when the rows are updated.
     * @async
     * @public
     */
    Update(db, name, rows) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                if(rows.length > 0) {
                    for(let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const sqlUpdate = 'UPDATE ' + name + ' SET ' + Object.keys(row).map((key) => '"' + key + '" = ?').join(',') + ' WHERE "id" = ?';
                        tx.executeSql(sqlUpdate, [...Object.values(row).map(v => {
                            if(Object.isObject(v) || Array.isArray(v)) {
                                return JSON.stringify(v);
                            } else if((v + '').isDate()) {
                                return new Date(v).toUnixTime();
                            }
                            return v;
                        }), row.id]);
                    }
                }
            }, function(error) {
                reject(error);
            }, function() {
                resolve();
            });
        });
    }

    /**
     * Updates rows in a table in the given database based on a specified condition.
     * @param {object} db - The database object.
     * @param {string} table - The name of the table to update rows in.
     * @param {object} data - An object containing the fields and values to update.
     * @param {string} condition - A SQL condition string to specify which rows to update.
     * @returns {Promise} - Promise resolving when the rows are updated.
     * @async
     * @public
     */
    UpdateByCondition(db, table, data, condition) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                const fields = Object.keys(data);
                const d = fields.map(f => f + '=?');
                const sqlUpdate = 'UPDATE "' + table + '" SET ' + d.join(', ') + ' WHERE ' + condition;
                tx.executeSql(sqlUpdate, fields.map(field => data[field]));
            }, function(error) {
                reject(error);
            }, function() {
                resolve();
            });
        });
    }

    /**
     * Selects from table in the given database based on a specified condition.
     * @param {object} db - The database object.
     * @param {string} table - The name of the table to select from.
     * @param {string} fields - A comma-separated string of fields to select.
     * @param {string} condition - A SQL condition string to specify which rows to select.
     * @returns {Promise} - Promise resolving to the selected rows.
     * @async
     * @public
     */
    Select(db, name, fields = '*', where = '', orderby = '', limit = '') {  
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                const sqlSelect = 'SELECT ' + fields + ' FROM ' + name + (where ? ' WHERE ' + where : '') + (orderby ? ' ORDER BY ' + orderby : '') + (limit ? ' LIMIT ' + limit : '');
                tx.executeSql(sqlSelect, [], function(tx, results) {
                    const data = [];
                    for(let i = 0; i < results.rows.length; i++) {
                        data.push(results.rows.item(i));
                    }
                    resolve(data);
                }, function(error) {
                    reject(error);
                });
            });
        });
    }

    /**
     * Deletes rows from a table in the given database based on a specified condition.
     * @param {object} db - The database object.
     * @param {string} name - The name of the table to delete rows from.
     * @param {string} where - A SQL condition string to specify which rows to delete.
     * @returns {Promise} - Promise resolving when the rows are deleted.
     * @async
     * @public
     */
    Delete(db, name, where) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                const sqlDelete = 'DELETE FROM ' + name + (where ? ' WHERE ' + where : '');
                tx.executeSql(sqlDelete, [], function(tx, results) {
                    resolve(results);
                }, function(error) {
                    reject(error);
                });
            });
        });
    }

    /**
     * Closes the given database.
     * @param {object} db - The database object to close.
     * @returns {Promise} - Promise resolving when the database is closed.
     * @async
     * @public
     */
    Close(db) {
        return new Promise((resolve, reject) => {
            db.close(function() {
                resolve();
            }, function(error) {
                reject(error);
            });
        });
    }

}