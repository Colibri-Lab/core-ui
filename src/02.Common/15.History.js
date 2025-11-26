Colibri.Common.History = class {

    constructor(limit = 1000, newestFirst = true) {
        this._items = [];
        this._limit = parseInt(limit);
        this._newestFirst = newestFirst; // true = новые в начало
    }

    set limit(value) {
        this._limit = parseInt(value);
        if (this._items.length > this._limit) {
            if (this._newestFirst) {
                this._items = this._items.slice(0, this._limit);
            } else {
                this._items = this._items.slice(-this._limit);
            }
        }
    }

    get limit() {
        return this._limit;
    }

    set newestFirst(value) {
        this._newestFirst = !!value;
    }

    add(line) {
        const copy = Object.cloneRecursive(line); // твой метод клонирования

        if (this._newestFirst) {
            this._items.unshift(copy); // вставляем в начало
            if (this._items.length > this._limit) {
                this._items.pop(); // убираем старую в конце
            }
        } else {
            this._items.push(copy); // вставляем в конец
            if (this._items.length > this._limit) {
                this._items.shift(); // убираем старую в начале
            }
        }
    }

    push(line) {
        this.add(line);
    }

    pop() {
        return this._newestFirst ? this._items.shift() : this._items.pop();
    }

    setAll(value) {
        this._items = value.slice(0, this._limit);
    }

    getAll() {
        return this._items.slice();
    }

    crop(startIndex, endIndex) {
        return this._items.slice(startIndex, endIndex);
    }

    clear() {
        this._items = [];
    }

    resize(newLimit) {
        this.limit = newLimit;
    }
};
