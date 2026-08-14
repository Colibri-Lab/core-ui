/**
 * History class
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.History = class {

    /**
     * Creates an instance of the History class.
     * @param {number} [limit=1000] - The maximum number of items to store in the history.
     * @param {boolean} [newestFirst=true] - Whether to store the newest items at the beginning of the history.
     * @constructor
     * @public
     */
    constructor(limit = 1000, newestFirst = true) {
        this._items = [];
        this._limit = parseInt(limit);
        this._newestFirst = newestFirst; // true = новые в начало
    }

    /**
     * Gets the maximum number of items to store in the history.
     * @type {number}
     */
    get limit() {
        return this._limit;
    }

    /**
     * Sets the maximum number of items to store in the history.
     * @param {number} value - The maximum number of items.
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
     * Gets the starting position for row values in the history.
     * @type {number}
     */
    get rowValueStartPosition() {
        return 0;
    }

    /**
     * Sets the starting position for row values in the history.
     * @param {number} value - The starting position for row values.
     * @type {number}
     */
    set newestFirst(value) {
        this._newestFirst = !!value;
    }

    /**
     * Adds a new item to the history.
     * @param {Object} line - The item to add to the history.
     * @returns {void}
     * @public
     */
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

    /**
     * Adds a new item to the history (alias for add method).
     * @param {Object} line - The item to add to the history.
     * @returns {void}
     * @deprecated Use the add method instead.
     */
    push(line) {
        this.add(line);
    }

    /**
     * Removes and returns the most recent item from the history.
     * @returns {Object} - The most recent item from the history.
     * @public
     */
    pop() {
        return this._newestFirst ? this._items.shift() : this._items.pop();
    }

    /**
     * Sets the entire history to the specified array of items.
     * @param {Array} value - The array of items to set as the history.
     * @returns {void}
     * @throws {Error} - Throws an error if the provided value is not an array.
     * @public
     */
    setAll(value) {
        this._items = value.slice(0, this._limit);
    }

    /**
     * Gets a copy of all items in the history.
     * @returns {Array} - A copy of all items in the history.
     * @public
     */
    getAll() {
        return this._items.slice();
    }

    /**
     * Crops the history to the specified range of items.
     * @param {number} startIndex - The starting index of the range to crop.
     * @param {number} endIndex - The ending index of the range to crop.
     * @returns {Array} - A new array containing the cropped items from the history.
     * @throws {Error} - Throws an error if the provided indices are out of bounds.
     * @public
     * @example
     * ```
     * const history = new Colibri.Common.History();
     * history.add({ id: 1, name: 'Item 1' });
     * history.add({ id: 2, name: 'Item 2' });
     * const croppedItems = history.crop(0, 1); // Returns [{ id: 1, name: 'Item 1' }]
     * ```
     */
    crop(startIndex, endIndex) {
        return this._items.slice(startIndex, endIndex);
    }

    /**
     * Clears all items from the history.
     * @returns {void}
     * @example
     * ```
     * const history = new Colibri.Common.History();
     * history.add({ id: 1, name: 'Item 1' });
     * history.clear(); // Clears all items from the history
     * ```
     */
    clear() {
        this._items = [];
    }

    /**
     * Resizes the history to the specified limit, removing excess items if necessary.
     * @param {number} newLimit - The new maximum number of items to store in the history.
     * @returns {void}
     * @example
     * ```
     * const history = new Colibri.Common.History(5);
     * history.add({ id: 1, name: 'Item 1' });
     * history.add({ id: 2, name: 'Item 2' });
     * history.resize(1); // Resizes the history to a limit of 1, removing excess items
     * ```
     */
    resize(newLimit) {
        this.limit = newLimit;
    }

}
