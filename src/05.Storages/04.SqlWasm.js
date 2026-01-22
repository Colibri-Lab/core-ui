Colibri.Storages.SqlWasm = class extends Colibri.Events.Dispatcher {

    _db = null;
    _sql = null;

    static loaded = false;

    static Load() {
        return new Promise((resolve, reject) => {
            if (Colibri.Storages.SqlWasm.loaded) {
                initSqlJs({
                    locateFile: Colibri.Storages.SqlWasm.loaded
                }).then((SQL) => {
                    resolve(SQL);
                });
            } else {
                Colibri.Common.LoadScript((!App.Device.isElectron ? '/' : '') + 'res/sqlwasm/sql-wasm.js').then(() => {
                    Colibri.Storages.SqlWasm.loaded = file => `${(!App.Device.isElectron ? '/' : '')}res/sqlwasm/${file}`;
                    initSqlJs({
                        locateFile: Colibri.Storages.SqlWasm.loaded
                    }).then((SQL) => {
                        resolve(SQL);
                    });
                }).catch(() => {                
                    Colibri.Common.LoadScript('https://unpkg.com/sql.js@1.8.0/dist/sql-wasm.js').then(() => {
                        Colibri.Storages.SqlWasm.loaded = file => `https://unpkg.com/sql.js@1.8.0/dist/${file}`;
                        initSqlJs({
                            locateFile: file => `https://unpkg.com/sql.js@1.8.0/dist/${file}`
                        }).then((SQL) => {
                            resolve(SQL);
                        });
                    });
                });
            }
        });
    }


    constructor() {
        super();
        this.RegisterEvent('Loaded', false, 'When SQL is loaded');
        this.RegisterEvent('Changed', false, 'When SQL is changed');

        Colibri.Storages.SqlWasm.Load().then(SQL => {
            this._sql = SQL;
            try {
                this._db = new this._sql.Database([]);
            } catch (e) {
                console.log(e);
            }

            this.Dispatch('Loaded');
        });

    }

    CreateEmptyDatabase(structure) {

        structure = this._convertStructure(structure);
        for (const table of structure) {
            try {
                this._db.run(table);
            } catch (e) {
                // console.log(e);
            }
        }

        return Promise.resolve();
    }

    get dbCreated() {
        return !!this._db;
    }

    _createTable(storage) {
        if (Object.isObject(storage)) {

            const create = [
                'DROP TABLE IF EXISTS "' + storage.name + '";',
                'CREATE TABLE "' + storage.name + '" (',
            ];
            storage.additional.forEach(field => {
                create.push('   "' + field.name + '" ' + field.type + ',');
            })
            const flds = [];
            Object.forEach(storage.fields, (name, field) => {
                if (storage.except.indexOf(name) === -1) {
                    let type = 'TEXT';
                    if (field.class === 'float') {
                        type = 'REAL';
                    } else if (field.class === 'int') {
                        type = 'INTEGER';
                    } else if (field.class === 'bool') {
                        type = 'INTEGER';
                    } else if (field.class === 'string') {
                        type = 'TEXT';
                    }
                    flds.push('   "' + name + '" ' + type);
                }
            });
            create.push(flds.join(',\n'));
            create.push(');');
            console.log(create.join('\n'));
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

    OpenBytes(bytes) {
        return new Promise((resolve, reject) => {
            this.Close();
            this._db = new this._sql.Database(bytes);
            resolve();
        });
    }


    Open(base64) {
        return new Promise((resolve, reject) => {
            this.Close();
            if (base64 instanceof Blob) {
                base64.arrayBuffer().then(binaryArray => {
                    const uint8 = new Uint8Array(binaryArray);
                    this._db = new this._sql.Database(uint8);
                    resolve();
                });
            } else {
                const binaryArray = this._base64ToUint8Array(base64);
                this._db = new this._sql.Database(binaryArray);
                resolve();
            }
        });
    }

    Close() {
        this._db.close();
    }

    Insert(table, data) {
        if (data.length == 0) {
            return;
        }

        const errors = [];
        const fields = Object.keys(data[0]);
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO "${table}" ("${fields.join('", "')}") VALUES (${placeholders})`;
        const stmt = this._db.prepare(sql);

        for (const row of data) {
            const values = fields.map(f => {
                let v = row[f];
                if (v === undefined) v = null;
                if (v === true || v === false) v = v ? 1 : 0;
                if (Object.isObject(v) || Array.isArray(v)) v = JSON.stringify(v);
                return v;
            });

            try {
                stmt.run(values);
            } catch (e) {
                console.error('Ошибка вставки: ' + e, values);
                errors.push({message: 'Ошибка вставки: ' + e, values});
            }
        }

        stmt.free();

        if(errors.length > 0) {
            throw 'Ошибка вставки: ' + errors.map(e => e.message).join('<br />');
        }

        this.Dispatch('Changed');
    }

    Update(table, data, condition) {
        const fields = Object.keys(data);
        const d = fields.map(f => f + '=?');
        this._db.run('UPDATE "' + table + '" SET ' + d.join(', ') + ' WHERE ' + condition, fields.map(field => data[field]));
        this.Dispatch('Changed');
    }

    Delete(table, condition = '') {
        this._db.run('DELETE FROM "' + table + '"' + (condition ? ' WHERE ' + condition : ''), []);
        this.Dispatch('Changed');
    }

    /**
     * Select from database
     * @example select * from table where field1=[[param1:string]] and field2='sample2' or field3=[[param2:integer]]
     * @param {String} query 
     * @param {Object} params
     * @returns {Array} 
     */
    Query(query, params) {
        // console.log(query, params);
        const d = this._prepareQuery(query, params);
        if (d.values.length > 0) {
            const stmt = this._db.prepare(d.query);
            stmt.bind(d.values);
            const rows = [];
            while (stmt.step()) {
                rows.push(stmt.getAsObject());
            }
            stmt.free();
            return rows;
        } else {
            return this._convertToObjects(this._db.exec(d.query));
        }
    }

    LoadAll(table) {
        const query = 'SELECT * FROM "' + table + '"';
        return this.Query(query, []);
    }

    LoadBy(table, filters, order = '') {
        const d = this._convertFilters(filters);
        const query = 'SELECT * FROM "' + table + '" ' + (d.filter ? 'WHERE ' + d.filter : '') + (order ? ' ORDER BY ' + order : '');
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
        for (let t = start; t < end; t += step) {
            steps.push(t);
        }

        const ret = [];
        const d = this._convertFilters(filters);
        for (const binStart of steps) {
            const binEnd = binStart + step;
            const query = `
                SELECT COUNT(*) as results_count
                FROM ${table}
                WHERE ${field} BETWEEN [[min:${type}]] AND [[max:${type}]]` + (d.filter ? 'AND ' + d.filter : '');
            const params = Object.assign(d.params, {
                min: field === 'datecreated' ? new Date(binStart * 1000).toLocalDateTimeString() : binStart,
                max: field === 'datecreated' ? new Date(binEnd * 1000).toLocalDateTimeString() : binEnd
            });
            const res = this.Query(query, params);
            ret.push({
                start: field === 'datecreated' ? new Date(binStart * 1000).toDbDate() : binStart,
                end: field === 'datecreated' ? new Date(binEnd * 1000).toDbDate() : binEnd,
                count: res[0].results_count
            });
        }
        return ret;
    }

    ExportBytes() {
        return this._db.export();
    }

    Export() {
        const binaryArray = this.ExportBytes();
        return new Blob([binaryArray], { type: 'application/octet-stream' });
    }

    _convertToObjects(result) {
        if (result.length === 0) {
            return [];
        }

        const ret = [];
        const r = result[0];
        const fs = r.columns;
        for (const v of r.values) {
            const r = {};
            for (let i = 0; i < fs.length; i++) {
                r[fs[i]] = v[i];
            }
            ret.push(r);
        }
        return ret;

    }

    _convertFilters(filters) {
        let filter = [];
        const params = {};
        const filterNames = Object.keys(filters);
        for (const name of filterNames) {
            const f = filters[name];
            if (name === 'datecreated') {
                // hack
                filter.push('"datecreated" BETWEEN [[datecreated1:string]] AND [[datecreated2:string]]');
                params['datecreated1'] = (f[0] instanceof Date ? f[0] : f[0].toDate()).toLocalDateTimeString();
                params['datecreated2'] = (f[1] instanceof Date ? f[1] : f[1].toDate()).toLocalDateTimeString();
            } else if (Array.isArray(f)) {
                if (f.length === 2) {
                    filter.push('("' + name + '" BETWEEN [[' + name + '1:string]] AND [[' + name + '2:string]]) OR ("' + name + '" IN (' + f.map(v => v.isNumeric() ? v : '\'' + v + '\'') + '))');
                    params[name + '1'] = f[0];
                    params[name + '2'] = f[1];
                } else {
                    filter.push('"' + name + '" IN (' + f.map(v => v.isNumeric() ? v : '\'' + v + '\'') + ')');
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
                case 'double':
                    value = Number(value);
                    break;
                case 'bool':
                    value = value ? 1 : 0;
                    break;
                default:
                    value = String(value);
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
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }


}