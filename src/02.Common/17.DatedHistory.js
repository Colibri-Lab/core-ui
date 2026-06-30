Colibri.Common.DatedHistory = class {

    constructor(limit = 1000, newestFirst = true) {
        this._items = [];
        this._limit = parseInt(limit);
        this._newestFirst = newestFirst; // true = новые в начало
        this._dataType = Float64Array;
    }

    /**
     * @returns {Number} The date shift in nanoseconds
     */
    get dateShiftMs() {
        return this._dateShift;
    }

    /**
     * @returns {Number} The date shift in nanoseconds
     */
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

    /**
     * Compares in nanoseconds two dates and returns the difference in nanoseconds between them.
     * If the difference is less than 5 nanoseconds, it returns 0.
     * @param {BigInt} date1 Date to compare
     * @param {BigInt} date2 Date compare with
     * @returns BigInt nanoseconds between two dates
     */
    measure(date1, date2) {
        if(date1 instanceof Colibri.Common.FDate) {
            date1 = date1.toBigIntNanoseconds();
        }
        if(date2 instanceof Colibri.Common.FDate) {
            date2 = date2.toBigIntNanoseconds();
        }
        const diff = date1 >= date2 ? date1 - date2 : date2 - date1;

        if (diff < 5n) {
            return 0n;
        }

        return diff / this._dateShift;
    }

    get emptyValue() {
        return this._emptyValue;
    }

    set emptyValue(value) {
        this._emptyValue = value;
    }

    set dataType(value) {
        this._dataType = value;
    }

    get dataType() {
        return this._dataType;
    }

    _add(date, chunk, duration = null) {
        if (duration) {
            this._dateShift = BigInt(duration);
        }

        const cloned = {
            date: date,
            duration: this._dateShift,
            chunk: Object.cloneRecursive(chunk)
        }

        if (this._items.length == 0) {
            this._items.push(cloned);
        } else {
            if (this._newestFirst) {

                const oldDate = this._items[0].date;
                let unshiftCount = Math.floor(Number(this.measure(date, oldDate) / 1000000n / 1000n)); // milliseconds
                while (unshiftCount-- > 1) {
                    const emptyItem = {
                        date: oldDate.addNanoseconds(this._dateShift * (BigInt(unshiftCount) + 1n)),
                        duration: this._dateShift,
                        chunk: (new this._dataType(chunk.length)).fill(this._emptyValue)
                    };
                    this._items.unshift(emptyItem);
                    if (this._items.length > this._limit) {
                        this._items.pop(); // убираем старую в конце
                    }
                }

                this._items.unshift(cloned); // вставляем в начало
                if (this._items.length > this._limit) {
                    this._items.pop(); // убираем старую в конце
                }
            } else {
                const oldDate = this._items[this._items.length - 1].date;
                let pushCount = Math.floor(Number(this.measure(date, oldDate) / 1000000n)); // milliseconds
                while (pushCount-- > 1) {
                    const emptyItem = {
                        date: oldDate.addNanoseconds(this._dateShift * BigInt(this._limit - pushCount)),
                        duration: this._dateShift,
                        chunk: (new this._dataType(chunk.length)).fill(this._emptyValue)
                    };
                    this._items.push(emptyItem);
                    if (this._items.length > this._limit) {
                        this._items.shift(); // убираем старую в начале
                    }
                }

                this._items.push(cloned); // вставляем в конец
                if (this._items.length > this._limit) {
                    this._items.shift(); // убираем старую в начале
                }
            }
        }
    }

    addObject(chunkObject) {
        // {
        //     "time": {
        //         "_sec": 1.6540993818464124e-189,
        //         "_fs": -101718058739137.48
        //     },
        //     "duration": 9.999999717180685e-10, // miliseconds
        //     "chunk": { ... }
        // }
        this._add(chunkObject.time, chunkObject.chunk, chunkObject.duration);

    }

    add(line, datePosition = 0) {
        this._add(line[datePosition], line, this._dateShift);
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

    /**
     * Crop items by method
     * @param {Function} startF index search method
     * @param {Function} endF index search method
     * @returns Array of items cropped by the index search method
     */
    crop(startF, endF) {
        startF = startF || (() => true);
        endF = endF || (() => true);
        const startIndex = this._items.findIndex(startF);
        if (startIndex === -1) {
            return [];
        }
        let endIndex = this._items.length - 1;
        for(let i = this._items.length - 1; i > startIndex; i--) {
            if(endF(this._items[i])) {
                endIndex = i;
            }
        }
        return this._items.slice(startIndex, endIndex);
    }

    clear() {
        this._items = [];
    }

    resize(newLimit) {
        this.limit = newLimit;
    }
};
