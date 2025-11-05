Colibri.Storages.Sqlite = class extends Colibri.Events.Dispatcher {

    _db = null;
    _name = null;

    static loaded = true;

    static Load() {
        return Promise.resolve();
    }

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

    get dbCreated() {
        return !!this._db;
    }

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

    Close() {
        if (this._db) {
            try { this._db.close(); } catch (e) { }
            this._db = null;
        }
    }

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

    _convertStructure(storages) {
        const result = [];
        for (const storage of storages) {
            const table = this._createTable(storage);
            result.push(table);
        }
        return result;
    }

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

    Update(table, data, condition) {
        const fields = Object.keys(data);
        const setClause = fields.map(f => f + '=?').join(', ');
        const sql = `UPDATE "${table}" SET ${setClause} WHERE ${condition}`;
        const values = fields.map(f => data[f]);

        return new Promise((resolve, reject) => {
            this._db.executeSql(sql, values, resolve, reject);
        });
    }

    Delete(table, condition = '') {
        const sql = `DELETE FROM "${table}"${condition ? ' WHERE ' + condition : ''}`;
        return new Promise((resolve, reject) => {
            this._db.executeSql(sql, [], resolve, reject);
        });
    }

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

    LoadAll(table) {
        return this.Query(`SELECT * FROM "${table}"`);
    }

    LoadBy(table, filters, order = '') {
        const d = this._convertFilters(filters);
        const query = `SELECT * FROM "${table}" ${d.filter ? 'WHERE ' + d.filter : ''}${order ? ' ORDER BY ' + order : ''}`;
        return this.Query(query, d.params);
    }

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

    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(btoa(reader.result));
            reader.onerror = reject;
            reader.readAsBinaryString(blob);
        });
    }

    _base64ToBlob(base64, mime = '') {
        const byteString = atob(base64.split(',')[1] || base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
    }

    _convertToObjects(result) {
        return result || [];
    }

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

    _base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
    }
}
