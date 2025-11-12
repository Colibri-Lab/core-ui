Colibri.Common.History = class {
 
    constructor(limit = 1000) {
        this.limit = parseInt(limit);
    }

    set limit(value) {
        this._limit = parseInt(value);
    }

    get limit() {
        return this._limit;
    }

    add(line) {
        if (this._items.length >= this._limit)
            this._items.shift();
        this._items.push(line.slice());
    }

    getAll() {
        return this._items;
    }

    clear() {
        this._items = new Array(this._limit);
    }

}