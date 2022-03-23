Colibri.Storages.Item = class extends Colibri.Events.Dispatcher {

    /**
     * @constructor
     * @param {string} [name] название обьекта
     * @param {*} [d] данные
     * @param {Colibri.Storages.Item} [parent] родительский обьект
     */
    constructor(name, d, parent) {
        super();

        this._name = name;
        this._data = {};
        this._parent = parent || null;

        if (d instanceof Colibri.Storages.Item) {
            this._data = d.data;
        } else if (Array.isArray(d)) {
            this._data = Object.assign({}, d);
        } else if (d instanceof Object) {
            this._data = d;
        } else if (typeof d == 'string') {
            this._data = JSON.parse(d);
        }

        this.RegisterEvents();

        this._process();

    }

    RegisterEvents() {
        this.RegisterEvent('StorageItemUpdated', false, 'Когда данные обновлены');
    }

    /**
     * название обьекта
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Внитренние данные
     * @type {Object}
     */
    get data() {
        let d = {};
        Object.forEach(this._data, (k, v) => {
            if (v instanceof Colibri.Storages.Item) {
                d[k] = v.data;
            } else {
                d[k] = v;
            }
        })
        return d;
    }

    set data(value) {
        if(value === null) {
            this._data = null;
        }
        else {
            Object.forEach(value, (k, v) => {
                if(this._data[k] instanceof Colibri.Storages.Item) {
                    this._data[k].data = v;
                }
                else { 
                    this._data[k] = v;
                }
            });
        }

        this._process();
    }


    /**
     * @type {string} путь к обьекту
     */
    get path() {
        return (this._parent ? this._parent.path + '.' : '') + this.name;
    }

    __ItemUpdated(args) {
        this.Dispatch('StorageItemUpdated', args);
    }

    _process() {

        this._data instanceof Object && Object.forEach(this._data, (k, v) => {
            if (v instanceof Object && !(v instanceof Colibri.Storages.Item) && !(v instanceof Function)) {
                const d = new Colibri.Storages.Item(k, v, this);
                d.AddHandler('StorageItemUpdated', (event, args) => this.__ItemUpdated(args));
                this._data[k] = d;
            }
        });

        this.__ItemUpdated({path: this.path, item: this});

    }

    Query(path) {

        let p = path.split('.');
        let first = p.shift();
        if (first !== this._name) {
            throw new Error('path must start with the name of item ' + path + ' - ' + this._name);
        }

        if (p.length === 0) {
            return this;
        }

        first = p[0];
        if(this._data[first] === undefined) {
            const d = new Colibri.Storages.Item(first, {}, this);
            d.AddHandler('StorageItemUpdated', (event, args) => this.__ItemUpdated(args));
            this._data[first] = d;
        }

        if (p.length === 1) {
            return this._data[first];
        } else {
            const r = this._data[first];
            return r instanceof Colibri.Storages.Item ? r.Query(p.join('.')) : null;
        }
    }

}