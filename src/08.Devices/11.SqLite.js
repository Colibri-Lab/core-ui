
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

    get isAvailable() {
        return !!this._plugin;
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

                        const sqlInsert = 'INSERT INTO ' + name + '("' + Object.keys(row).join('","') + '") VALUES (' + Array.enumerate(0, Object.keys(row).length - 1, (i) => '?') + ')';
                        console.log(sqlInsert);
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

    Insert(db, name, rows = []) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                if(rows.length > 0) {
                    for(let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const sqlInsert = 'INSERT INTO ' + name + '("' + Object.keys(row).join('","') + '") VALUES (' + Array.enumerate(0, Object.keys(row).length - 1, (i) => '?') + ')';
                        console.log(sqlInsert);
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

    Update(db, name, rows) {
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                if(rows.length > 0) {
                    for(let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const sqlUpdate = 'UPDATE ' + name + ' SET ' + Object.keys(row).map((key) => key + ' = ?').join(',') + ' WHERE id = ?';
                        console.log(sqlUpdate);
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

    Select(db, name, fields = '*', where = '', orderby = '', limit = '') {  
        return new Promise((resolve, reject) => {
            db.transaction(function(tx) {
                const sqlSelect = 'SELECT ' + fields + ' FROM ' + name + (where ? ' WHERE ' + where : '') + (orderby ? ' ORDER BY ' + orderby : '') + (limit ? ' LIMIT ' + limit : '');
                console.log(sqlSelect);
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
                console.log(sqlDelete);
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