/**
 * Dated history class for managing time-stamped data chunks.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.DatedHistory = class {

    /**
     * Creates an instance of the DatedHistory class.
     * @param {number} [limit=1000] - The maximum number of items to store in the history.
     * @param {boolean} [newestFirst=true] - Whether to store the newest items at the beginning of the history.
     */
    constructor(limit = 1000, newestFirst = true) {
        this._items = [];
        this._limit = parseInt(limit);
        this._newestFirst = newestFirst; // true = новые в начало
        this._dataType = Float64Array;
    }

    /**
     * Gets the date shift in milliseconds.
     * @type {Number} The date shift in milliseconds
     */
    get dateShiftMs() {
        return this._dateShift;
    }

    /**
     * Sets the date shift in milliseconds.
     * @type {Number} The date shift in nanoseconds
     */
    set dateShiftMs(value) {
        this._dateShift = parseInt(value);
    }

    /**
     * Sets the maximum number of items to store in the history.
     * @type {number}
     */
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

    /**
     * Gets the maximum number of items to store in the history.
     * @type {number}
     */
    get limit() {
        return this._limit;
    }

    /**
     * Sets whether to store the newest items at the beginning of the history.
     * @type {boolean}
     */
    set newestFirst(value) {
        this._newestFirst = !!value;
    }

    /**
     * Gets whether to store the newest items at the beginning of the history.
     * @type {boolean}
     */
    set newestFirst(value) {
        this._newestFirst = !!value;
    }

    /**
     * Gets the starting position for row values in the history.
     * @type {number}
     */
    get rowValueStartPosition() {
        return 0;
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

    /**
     * Returns the empty value used for filling missing data in the history.
     * @type {any}
     */
    get emptyValue() {
        return this._emptyValue;
    }

    /**
     * Sets the empty value used for filling missing data in the history.
     * @type {any}
     */
    set emptyValue(value) {
        this._emptyValue = value;
    }

    /**
     * Sets the data type used for storing chunks in the history.
     * @type {Function}
     */
    set dataType(value) {
        this._dataType = value;
    }

    /**
     * Gets the data type used for storing chunks in the history.
     * @type {Function}
     */
    get dataType() {
        return this._dataType;
    }

    /**
     * Gets the length of the chunks stored in the history.
     * @type {number}
     */
    get chunkLength() {
        return this._chunkLength;
    }

    /**
     * Sets the length of the chunks stored in the history.
     * @type {number}
     */
    set chunkLength(value) {
        this._chunkLength = value;
    }

    /**
     * Adds a new item to the history with the specified date, chunk, and optional duration.
     * @param {BigInt} date - The date of the item to add.
     * @param {Array|TypedArray} chunk - The data chunk to add.
     * @param {BigInt|null} [duration=null] - The optional duration of the item in nanoseconds.
     * @returns {void}
     * @private
     */
    _add(date, chunk, duration = null) {
        if (duration) {
            this._dateShift = BigInt(duration);
        }

        const cloned = {
            date: date,
            duration: this._dateShift,
            chunk: Object.cloneRecursive(chunk)
        }

        this.chunkLength = cloned.chunk.length;

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

    /**
     * Adds a new object to the history with the specified chunk object containing time, duration, and chunk data.
     * @param {Object} chunkObject - The object containing time, duration, and chunk data.
     * @param {Object} chunkObject.time - The time of the item to add.
     * @param {number} chunkObject.duration - The duration of the item in milliseconds.
     * @param {Array|TypedArray} chunkObject.chunk - The data chunk to add.
     * @returns {void}
     */
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

    /**
     * Adds a new item to the history with the specified line array containing date and chunk data.
     * @param {Array} line - The array containing date and chunk data.
     * @param {number} [datePosition=0] - The index of the date in the line array.
     * @returns {void}
     * @description This method extracts the date and chunk data from the line array and adds it to the history.
     * The date is expected to be at the specified datePosition index, and the chunk data is expected to be at the next index.
     * If the datePosition is not provided, it defaults to 0 (the first element of the line array).
     */
    add(line, datePosition = 0) {
        this._add(line[datePosition], line, this._dateShift);
    }

    /**
     * Adds a new item to the history (alias for add method).
     * @param {Array} line - The array containing date and chunk data.
     * @param {number} [datePosition=0] - The index of the date in the line array.
     * @returns {void}
     * @deprecated Use the add method instead.
     * @description This method is an alias for the add method and is provided for backward compatibility.
     * It extracts the date and chunk data from the line array and adds it to the history.
     */
    push(line) {
        this.add(line);
    }

    /**
     * Removes and returns the most recent item from the history.
     * @returns {Object} - The most recent item from the history.
     * @description This method removes and returns the most recent item from the history.
     * If the history is empty, it returns undefined.
     */
    pop() {
        return this._newestFirst ? this._items.shift() : this._items.pop();
    }

    /**
     * Sets the entire history to the specified array of items.
     * @param {Array} value - The array of items to set as the history.
     * @returns {void}
     * @throws {Error} - Throws an error if the provided value is not an array.
     * @description This method replaces the entire history with the specified array of items.
     * It ensures that the number of items does not exceed the specified limit.
     * If the provided value is not an array, it throws an error.
     */
    setAll(value) {
        const newData = value.slice(0, this._limit);
        this._items = [];
        for (const item of newData) {
            this.add(item);
        }
    }

    /**
     * Gets a copy of all items in the history.
     * @returns {Array} - A copy of all items in the history.
     * @description This method returns a shallow copy of the array containing all items in the history.
     * It allows external code to access the history without modifying the original array.
     * The returned array can be used for further processing or analysis of the historical data.    
     */
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

    /**
     * Clears all items from the history.
     * @returns {void}
     * @description This method removes all items from the history, effectively resetting it to an empty state.
     * It can be used to start fresh or discard all previously stored historical data.
     * After calling this method, the history will be empty, and any subsequent calls to getAll() will return an empty array.
     * Note: This method does not affect the limit or other properties of the history; it only clears the stored items.
     * Use this method with caution, as it permanently removes all historical data from the history instance.
     * If you need to preserve the data, consider creating a backup or using the getAll() method before clearing the history.
     */
    clear() {
        debugger;
        this._items = [];
    }

    /**
     * Resizes the history to the specified new limit.
     * @param {number} newLimit - The new maximum number of items to store in the history.
     * @returns {void}
     */
    resize(newLimit) {
        this.limit = newLimit;
    }

    /**
     * Prepends the specified number of empty items to each chunk in the history.
     * @param {number} prependCount - The number of empty items to prepend to each chunk.
     * @returns {void}
     * @description This method iterates through each item in the history and prepends the specified number of empty items to the chunk data.
     * The empty items are filled with the emptyValue defined for the history. This can be useful for aligning or extending the data in the history.
     * Note: The method modifies the existing items in the history and does not create new items. It only affects the chunk data of each item.
     * Use this method with caution, as it may alter the structure of the historical data.
     */
    prependTo(prependCount) {
        this._items.forEach((item) => {
            item.chunk = item.chunk.prependTo(item.chunk.length + prependCount);
        });
    } 

    /**
     * Appends the specified number of empty items to each chunk in the history.
     * @param {number} appendCount - The number of empty items to append to each chunk.
     * @returns {void}
     * @description This method iterates through each item in the history and appends the specified number of empty items to the chunk data.
     * The empty items are filled with the emptyValue defined for the history. This can be useful for aligning or extending the data in the history.
     * Note: The method modifies the existing items in the history and does not create new items. It only affects the chunk data of each item.
     * Use this method with caution, as it may alter the structure of the historical data.
     */
    appendTo(appendCount) {
        this._items.forEach((item) => {
            item.chunk = item.chunk.appendTo(item.chunk.length + appendCount);
        });
    }

    /**
     * Crops the chunks of each item in the history to the specified start and end indices.
     * @param {number} startIndex - The starting index for cropping the chunks.
     * @param {number} endIndex - The ending index for cropping the chunks.
     * @returns {void}
     * @description This method iterates through each item in the history and crops the chunk data to the specified start and end indices.
     * The cropped chunks are then extrapolated to the original chunk length defined for the history. This can be useful for focusing on a specific range of data within the chunks.
     * Note: The method modifies the existing items in the history and does not create new items. It only affects the chunk data of each item.
     * Use this method with caution, as it may alter the structure of the historical data.
     */
    cropItems(startIndex, endIndex) {
        this._items.forEach((item) => {
            let chunk = item.chunk.crop(startIndex, endIndex);
            chunk = chunk.extrapolate(this.chunkLength);
            item.chunk = chunk;
        });
    }

};
