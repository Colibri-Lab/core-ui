/**
 * Represents a browser storage utility.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.BrowserStorage = class {
    /** @constructor */
    constructor() {}

    /**
     * Sets a value in the browser storage.
     * @param {string} name - The name of the item.
     * @param {*} [value=true] - The value to set. Defaults to true if not provided.
     */
    Set(name, value = true) {
        window.localStorage.setItem(name, value);
    }

    /**
     * Gets a value from the browser storage.
     * @param {string} name - The name of the item.
     * @returns {*} - The value retrieved from the storage.
     */
    Get(name) {
        return window.localStorage.getItem(name);
    }

    /**
     * Deletes an item from the browser storage.
     * @param {string} name - The name of the item to delete.
     */
    Delete(name) {
        window.localStorage.removeItem(name);
    }

    /**
     * Checks if an item exists in the browser storage.
     * @param {string} name - The name of the item to check.
     * @returns {boolean} - True if the item exists, false otherwise.
     */
    Has(name) {
        return !!this.Get(name);
    }
};

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
     */
    Set(name, value = true) {
        window.sessionStorage.setItem(name, value);
    }

    /**
     * Gets a value from the browser storage.
     * @param {string} name - The name of the item.
     * @returns {*} - The value retrieved from the storage.
     */
    Get(name) {
        return window.sessionStorage.getItem(name);
    }

    /**
     * Deletes an item from the browser storage.
     * @param {string} name - The name of the item to delete.
     */
    Delete(name) {
        window.sessionStorage.removeItem(name);
    }

    /**
     * Checks if an item exists in the browser storage.
     * @param {string} name - The name of the item to check.
     * @returns {boolean} - True if the item exists, false otherwise.
     */
    Has(name) {
        return !!this.Get(name);
    }
};