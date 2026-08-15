/**
 * Represents a browser session storage utility.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.SessionStorage = class {
    /** @constructor */
    constructor() {}

    /**
     * Sets a value in the browser storage.
     * @param {string} name - The name of the item.
     * @param {*} [value=true] - The value to set. Defaults to true if not provided.
     * @public
     * @example
     * ```
     * /// Set a value in the browser storage
     * App.Session.Set('myItem', 'myValue');
     * ```
     */
    Set(name, value = true) {
        window.sessionStorage.setItem(name, value);
    }

    /**
     * Gets a value from the browser storage.
     * @param {string} name - The name of the item.
     * @returns {*} - The value retrieved from the storage.
     * @public
     * @example
     * ```
     * /// Get a value from the browser storage
     * const value = App.Session.Get('myItem');
     * console.log('Retrieved value:', value);
     * ```
     */
    Get(name) {
        return window.sessionStorage.getItem(name);
    }

    /**
     * Deletes an item from the browser storage.
     * @param {string} name - The name of the item to delete.
     * @public
     * @example
     * ```
     * /// Delete an item from the browser storage
     * App.Session.Delete('myItem');
     * console.log('Item deleted from browser storage');
     * ```
     */
    Delete(name) {
        window.sessionStorage.removeItem(name);
    }

    /**
     * Checks if an item exists in the browser storage.
     * @param {string} name - The name of the item to check.
     * @returns {boolean} - True if the item exists, false otherwise.
     * @public
     * @example
     * ```
     * /// Check if an item exists in the browser storage
     * const exists = App.Session.Has('myItem');
     * console.log('Item exists:', exists);
     * ```
     */
    Has(name) {
        return !!this.Get(name);
    }
};