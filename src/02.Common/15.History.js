Colibri.Common.History = class {
 
    constructor(limit = 1000) {
        this.limit = parseInt(limit);
        this._items = new Array(this._limit);
    }

    set limit(value) {
        this._limit = parseInt(value);
    }

    get limit() {
        return this._limit;
    }

    add(line) {
        if (this._items.length >= this._limit){
            this._items.shift();
        }
        this._items.push(Object.cloneRecursive(line));
    }

    push(line) {
        this.add(line);
    }
    
    pop() {
        return this._items.pop();
    }

    getAll() {
        return this._items;
    }

    clear() {
        this._items = new Array(this._limit);
    }

    resize(newLimit) {
        this.limit = newLimit;
        this._items = this._items.slice(-this._limit);
    }

}