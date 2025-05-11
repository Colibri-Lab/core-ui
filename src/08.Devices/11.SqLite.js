
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

    Open(name, location = 'default') {
        return this._plugin.openDatabase({
            name,
            location
        });
    }

    CreateTable(db, name, fields, rows = []) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {

                const sqlCreate = 'CREATE TABLE IF NOT EXISTS ' + name + '(' + fields.join(',') + ')';
                tx.executeSql(sqlCreate);

                if(rows.length > 0) {
                    for(let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const sqlInsert = 'INSERT INTO ' + name + ' VALUES (' + Array.enumerate(0, Object.keys(row).length, (i) => '?') + ')';
                        tx.executeSql(sqlInsert, Object.values(row));
                    }
                }
            }, function(error) {
                reject(error);
            }, function() {
                resolve();
            });
        });
    }

    Insert(db, name, rows = []) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                if(rows.length > 0) {
                    for(let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const sqlInsert = 'INSERT INTO ' + name + ' VALUES (' + Object.keys(row).map((key) => key + ' = ?').join(',') + ')';
                        tx.executeSql(sqlInsert, Object.values(row));
                    }
                }
            }, function(error) {
                reject(error);
            }, function() {
                resolve();
            });
        });
    }

    Update(db, name, rows) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                if(rows.length > 0) {
                    for(let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const sqlUpdate = 'UPDATE ' + name + ' SET ' + Object.keys(row).map((key) => key + ' = ?').join(',') + ' WHERE id = ?';
                        tx.executeSql(sqlUpdate, [...Object.values(row), row.id]);
                    }
                }
            }, function(error) {
                reject(error);
            }, function() {
                resolve();
            });
        });
    }

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