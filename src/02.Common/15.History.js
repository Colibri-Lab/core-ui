Colibri.Common.History = class {
 
    constructor(limit = 1000) {
        this._limit = limit;
        this._items = new Array(limit);
        this._start = 0;
        this._count = 0;
    }

    set limit(value) {
        this._limit = value;
    }

    get limit() {
        return this._limit;
    }

    add(line) {
        const idx = (this._start + this._count) % this._limit;
        this._items[idx] = line;
        if (this._count < this._limit) {
            this._count++;
        } else {
            this._start = (this._start + 1) % this._limit;
        }
    }

    getAll() {
        const result = [];
        for (let i = 0; i < this._count; i++) {
            result.push(this._items[(this._start + i) % this._limit]);
        }
        return result;
    }

    clear() {
        this._items = new Array(this._limit);
        this._start = 0;
        this._count = 0;
    }

}