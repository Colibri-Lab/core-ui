Colibri.Common.DatedHistory = class {

    constructor(limit = 1000, newestFirst = true) {
        this._items = [];
        this._limit = parseInt(limit);
        this._newestFirst = newestFirst; // true = новые в начало
    }

    get dateShiftMs() {
        return this._dateShift;
    }

    set dateShiftMs(value) {
        this._dateShift = parseInt(value);
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

    get newestFirst() {
        return this._newestFirst;
    }

    set newestFirst(value) {
        this._newestFirst = !!value;
    }

    get rowValueStartPosition() {
        return 1;
    }

    measure(date1, date2) {
        if(Math.abs(date1 - date2) < 5) {
            return 0;
        }
        return Math.floor(Math.abs(date2 - date1) / this._dateShift);
    }

    get emptyValue() {
        return this._emptyValue;
    }

    set emptyValue(value) {
        this._emptyValue = value;
    }

    add(line, datePosition = 0) {
        const copy = Object.cloneRecursive(line); // твой метод клонирования
        const date = copy[datePosition];

        if (this._items.length == 0) {
            this._items.push(copy);
        } else {
            if (this._newestFirst) {

                const oldDate = this._items[0][datePosition];
                let unshiftCount = this.measure(date, oldDate);
                while (unshiftCount-- > 1) {
                    const emptyItem = new Float32Array(line.length);
                    emptyItem[datePosition] = oldDate + this._dateShift * (unshiftCount + 1);
                    emptyItem.fill(this._emptyValue);
                    this._items.unshift(emptyItem);
                }

                this._items.unshift(copy); // вставляем в начало
                if (this._items.length > this._limit) {
                    this._items.pop(); // убираем старую в конце
                }
            } else {
                const oldDate = this._items[this._items.length - 1][datePosition];
                let pushCount = this.measure(date, oldDate);
                while (pushCount-- > 1) {
                    const emptyItem = new Float32Array(line.length);
                    emptyItem[datePosition] = oldDate + this._dateShift * (this._limit - pushCount);
                    emptyItem.fill(this._emptyValue);
                    this._items.push(emptyItem);
                }

                this._items.push(copy); // вставляем в конец
                if (this._items.length > this._limit) {
                    this._items.shift(); // убираем старую в начале
                }
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
        const newData = value.slice(0, this._limit);
        this._items = [];
        for (const item of newData) {
            this.add(item);
        }
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
