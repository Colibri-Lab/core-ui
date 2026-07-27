/**
 * Colibri SQL storage implementation using SQLite plugin for Cordova and Electron.
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Storages
 */
Colibri.Storages.Sqlite = class extends Colibri.Events.Dispatcher {

    _db = null;
    _name = null;

    static loaded = true;

    /**
     * Loads the SQLite storage implementation.
     * @returns {Promise} A promise that resolves when the storage is loaded.
     * @static
     */
    static Load() {
        return Promise.resolve();
    }

    /**
     * Constructs an instance of the Colibri.Storages.Sqlite class.
     * @param {string} [name='local.db'] - The name of the SQLite database file.
     * @constructor
     */
    constructor(name = 'local.db') {
        super();
        this.RegisterEvent('Loaded', false, 'When SQL is loaded');
        this._name = name;

        const initDb = () => {
            if (!window.sqlitePlugin) {
                console.error('sqlitePlugin not found');
                return;
            }
            this._db = window.sqlitePlugin.openDatabase({ name, location: 'default' }, () => {
                this.Dispatch('Loaded');
            }, (err) => {
                console.error('Open database error:', err);
            });
        };

        if (window.cordova) {
            document.addEventListener('deviceready', initDb);
        } else {
            // Electron fallback
            initDb();
        }
    }

    /**
     * Creates an empty database with the specified structure.
     * @param {Array} structure - An array of table structures to create.
     * @returns {Promise} A promise that resolves when the database is created.
     */
    CreateEmptyDatabase(structure) {
        structure = this._convertStructure(structure);
        return new Promise((resolve, reject) => {

            let counts = structure.length * 2;

            for (const table of structure) {
                try {
                    const dropandcreate = table.split(';');
                    this._db.executeSql(dropandcreate[0], [], () => {
                        counts--;
                    }, () => { });
                    this._db.executeSql(dropandcreate[1], [], () => {
                        counts--;
                    }, () => { });
                } catch (e) {
                    console.log('Create table error:', e);
                }
            }

            Colibri.Common.Wait(() => counts === 0).then(() => {
                resolve();
            })

        });


    }

    /**
     * Checks if the database has been created and is available for use.
     * @type {boolean}
     * @readonly
     * @returns {boolean} True if the database is created, false otherwise.
     */
    get dbCreated() {
        return !!this._db;
    }

    /**
     * Opens the SQLite database from a base64 string or Blob object.
     * @param {string|Blob} base64OrBlob - The base64 string or Blob representing the database.
     * @returns {Promise} A promise that resolves when the database is opened.
     */
    Open(base64OrBlob) {
        return new Promise((resolve, reject) => {
            this.Close();
            if (!base64OrBlob) return resolve();

            const loadData = (json) => {
                try {
                    const data = JSON.parse(json);
                    this._db = window.sqlitePlugin.openDatabase({ name: this._name, location: '' }, () => {
                        const promises = Object.keys(data).map(table => {
                            const rows = data[table];
                            if (!rows.length) return Promise.resolve();
                            return this.Insert(table, rows);
                        });
                        Promise.all(promises).then(resolve, reject);
                    }, reject);
                } catch (e) {
                    reject(e);
                }
            };

            if (base64OrBlob instanceof Blob) {
                base64OrBlob.text().then(loadData).catch(reject);
            } else {
                try {
                    loadData(atob(base64OrBlob));
                } catch (e) {
                    reject(e);
                }
            }
        });
    }

    /**
     * Closes the SQLite database connection if it is open.
     */
    Close() {
        if (this._db) {
            try { this._db.close(); } catch (e) { }
            this._db = null;
        }
    }

    /**
     * Creates a SQL table based on the provided storage structure.
     * @param {Object} storage - The storage structure defining the table.
     * @returns {string} The SQL statement to create the table.
     * @private
     */
    _createTable(storage) {
        if (Object.isObject(storage)) {
            const create = [
                'DROP TABLE IF EXISTS "' + storage.name + '";',
                'CREATE TABLE IF NOT EXISTS "' + storage.name + '" ('
            ];
            storage.additional.forEach(field => {
                create.push('   "' + field.name + '" ' + field.type + ',');
            });
            const flds = [];
            Object.forEach(storage.fields, (name, field) => {
                if (storage.except.indexOf(name) === -1) {
                    let type = 'TEXT';
                    if (field.class === 'float') type = 'REAL';
                    else if (field.class === 'int' || field.class === 'bool') type = 'INTEGER';
                    else if (field.class === 'string') type = 'TEXT';
                    flds.push('   "' + name + '" ' + type);
                }
            });
            create.push(flds.join(',\n'));
            create.push(');');
            return create.join('\n');
        } else {
            return storage;
        }
    }

    /**
     * Converts an array of storage structures into SQL table creation statements.
     * @param {Array} storages - An array of storage structures.
     * @returns {Array} An array of SQL statements for creating tables.
     * @private
     */
    _convertStructure(storages) {
        const result = [];
        for (const storage of storages) {
            const table = this._createTable(storage);
            result.push(table);
        }
        return result;
    }

    /**
     * Inserts multiple rows into a specified table in the SQLite database.
     * @param {string} table - The name of the table to insert rows into.
     * @param {Array} data - An array of objects representing the rows to insert.
     * @returns {Promise} A promise that resolves when the rows are inserted.
     */
    Insert(table, data) {
        if (!data.length) return Promise.resolve();

        const fields = Object.keys(data[0]);
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO "${table}" ("${fields.join('", "')}") VALUES (${placeholders})`;

        return new Promise((resolve, reject) => {
            this._db.sqlBatch(
                data.map(row => {
                    const values = fields.map(f => {
                        let v = row[f];
                        if (v === undefined) v = null;
                        if (v === true || v === false) v = v ? 1 : 0;
                        if (Object.isObject(v) || Array.isArray(v)) v = JSON.stringify(v);
                        return v;
                    });
                    return [sql, values];
                }),
                resolve,
                reject
            );
        });
    }

    /**
     * Updates rows in a specified table based on a condition.
     * @param {string} table - The name of the table to update.
     * @param {Object} data - An object representing the fields and values to update.
     * @param {string} condition - The SQL condition to determine which rows to update.
     * @returns {Promise} A promise that resolves when the rows are updated.
     */
    Update(table, data, condition) {
        const fields = Object.keys(data);
        const setClause = fields.map(f => f + '=?').join(', ');
        const sql = `UPDATE "${table}" SET ${setClause} WHERE ${condition}`;
        const values = fields.map(f => data[f]);

        return new Promise((resolve, reject) => {
            this._db.executeSql(sql, values, resolve, reject);
        });
    }

    /**
     * Deletes rows from a specified table based on a condition.
     * @param {string} table - The name of the table to delete rows from.
     * @param {string} [condition=''] - The SQL condition to determine which rows to delete.
     * @returns {Promise} A promise that resolves when the rows are deleted.
     */
    Delete(table, condition = '') {
        const sql = `DELETE FROM "${table}"${condition ? ' WHERE ' + condition : ''}`;
        return new Promise((resolve, reject) => {
            this._db.executeSql(sql, [], resolve, reject);
        });
    }

    /**
     * Executes a SQL query with optional parameters and returns the result as an array of objects.
     * @param {string} query - The SQL query to execute.
     * @param {Object} [params={}] - An object containing parameter bindings for the query.
     * @returns {Promise<Array>} A promise that resolves with an array of result objects.
     */
    Query(query, params = {}) {
        const d = this._prepareQuery(query, params);
        return new Promise((resolve, reject) => {
            this._db.executeSql(
                d.query,
                d.values,
                (res) => {
                    const rows = [];
                    for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
                    resolve(rows);
                },
                reject
            );
        });
    }

    /**
     * Load all rows from a specified table in the SQLite database.
     * @param {string} table - The name of the table to load rows from.
     * @returns {Promise<Array>} A promise that resolves with an array of all rows in the table.
     */
    LoadAll(table) {
        return this.Query(`SELECT * FROM "${table}"`);
    }

    /**
     * Loads rows from a specified table based on provided filters and optional order.
     * @param {string} table - The name of the table to load rows from.
     * @param {Object} filters - An object containing filter parameters for the query.
     * @param {string} [order=''] - An optional SQL ORDER BY clause to sort the results.
     * @returns {Promise<Array>} A promise that resolves with an array of filtered rows.
     */
    LoadBy(table, filters, order = '') {
        const d = this._convertFilters(filters);
        const query = `SELECT * FROM "${table}" ${d.filter ? 'WHERE ' + d.filter : ''}${order ? ' ORDER BY ' + order : ''}`;
        return this.Query(query, d.params);
    }

    /**
     * Performs a histogram aggregation on a specified field in a table, based on provided filters, step size, and range.
     * @param {string} table - The name of the table to perform the histogram on.
     * @param {Object} filters - An object containing filter parameters for the query.
     * @param {string} field - The field to aggregate for the histogram.
     * @param {number} step - The step size for the histogram bins.
     * @param {number|Date} max - The maximum value for the histogram range.
     * @param {number|Date} min - The minimum value for the histogram range.
     * @returns {Promise<Array>} A promise that resolves with an array of histogram bin objects, each containing start, end, and count properties.
     */
    HistogramByField(table, filters, field, step, max, min) {
        filters = Object.cloneRecursive(filters);
        delete filters[field];

        let start = min;
        let end = max;
        let type = 'double';
        if (field === 'datecreated') {
            start = Math.floor(min.getTime() / 1000);
            end = Math.floor(max.getTime() / 1000);
            type = 'string';
        }

        const steps = [];
        for (let t = start; t < end; t += step) steps.push(t);

        const ret = [];
        const d = this._convertFilters(filters);

        const promises = steps.map(binStart => {
            const binEnd = binStart + step;
            const query = `
                SELECT COUNT(*) as results_count
                FROM ${table}
                WHERE ${field} BETWEEN [[min:${type}]] AND [[max:${type}]]` + (d.filter ? ' AND ' + d.filter : '');
            const params = Object.assign({}, d.params, {
                min: field === 'datecreated' ? new Date(binStart * 1000).toLocalDateTimeString() : binStart,
                max: field === 'datecreated' ? new Date(binEnd * 1000).toLocalDateTimeString() : binEnd
            });
            return this.Query(query, params).then(res => ({
                start: field === 'datecreated' ? new Date(binStart * 1000).toDbDate() : binStart,
                end: field === 'datecreated' ? new Date(binEnd * 1000).toDbDate() : binEnd,
                count: res[0].results_count
            }));
        });

        return Promise.all(promises);
    }

    /**
     * Exports the current state of the database as a Blob object.
     * @returns {Promise<Blob>} A promise that resolves with a Blob representing the exported database.
     */
    Export() {
        return new Promise((resolve, reject) => {
            if (!this._db || !this._db.export) {
                return reject(new Error('Database not initialized or export() not supported'));
            }

            this._db.export(arrayBuffer => {
                const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
                resolve(blob);
            }, reject);
        });
    }

    /**
     * Convert the result set from the database into an array of objects.
     * @param {Array} result - The result set from the database.
     * @returns {Array} An array of objects representing the result set.    
     * @private
     */
    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(btoa(reader.result));
            reader.onerror = reject;
            reader.readAsBinaryString(blob);
        });
    }

    /**
     * Converts a base64 string to a Blob object.
     * @param {string} base64 - The base64 string to convert.
     * @param {string} [mime=''] - The MIME type of the Blob.
     * @returns {Blob} A Blob object representing the base64 data.
     * @private
     */
    _base64ToBlob(base64, mime = '') {
        const byteString = atob(base64.split(',')[1] || base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
    }

    /**
     * Converts filter parameters into SQL WHERE clause and parameter bindings.
     * @param {Object} filters - The filter parameters.
     * @returns {Object} An object containing the SQL WHERE clause and parameter bindings.
     * @private
     */
    _convertToObjects(result) {
        return result || [];
    }

    /**
     * Converts filter parameters into SQL WHERE clause and parameter bindings.
     * @param {Object} filters - The filter parameters.
     * @returns {Object} An object containing the SQL WHERE clause and parameter bindings.
     * @private
     */
    _convertFilters(filters) {
        let filter = [];
        const params = {};
        const filterNames = Object.keys(filters);
        for (const name of filterNames) {
            const f = filters[name];
            if (name === 'datecreated') {
                filter.push('"datecreated" BETWEEN [[datecreated1:string]] AND [[datecreated2:string]]');
                params['datecreated1'] = (f[0] instanceof Date ? f[0] : f[0].toDate()).toLocalDateTimeString();
                params['datecreated2'] = (f[1] instanceof Date ? f[1] : f[1].toDate()).toLocalDateTimeString();
            } else if (Array.isArray(f)) {
                if (f.length === 2) {
                    filter.push('("' + name + '" BETWEEN [[' + name + '1:string]] AND [[' + name + '2:string]])');
                    params[name + '1'] = f[0];
                    params[name + '2'] = f[1];
                } else {
                    filter.push('"' + name + '" IN (' + f.map(v => v.isNumeric() ? v : `'${v}'`) + ')');
                }
            }
        }
        return { filter: filter.join(' AND '), params };
    }

    /**
     * Prepares an SQL query by replacing parameter placeholders with actual values.
     * @param {String} template - The SQL query template.
     * @param {Object} params - The parameter bindings.
     * @returns {Object} An object containing the final query and values array.
     * @private
     */
    _prepareQuery(template, params) {
        const values = [];
        const query = template.replace(/\[\[(\w+):(string|integer|double|bool)\]\]/g, (_, name, type) => {
            let value = params[name];
            if (value === undefined) throw new Error(`Missing param: ${name}`);
            switch (type) {
                case 'integer':
                case 'double': value = Number(value); break;
                case 'bool': value = value ? 1 : 0; break;
                default: value = String(value);
            }
            values.push(value);
            return '?';
        });
        return { query, values };
    }

    /**
     * Converts a base64 string to a Uint8Array.
     * @param {String} base64 - The base64 string to convert.
     * @returns {Uint8Array} The resulting Uint8Array.
     * @private 
     */    
    _base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
    }
}
