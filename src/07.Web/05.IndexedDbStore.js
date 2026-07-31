
/**
 * IndexedDB storage class for managing messages in the Comet system.   
 * @class 
 * @extends Colibri.Common.AbstractMessageStore
 * @memberof Colibri.Web
 */
Colibri.Web.IndexedDbStore = class extends Colibri.Common.AbstractMessageStore {

    /**
     * Initializes the IndexedDB storage for messages.
     * @constructor
     */
    constructor() {
        super();

        this._dbName = 'comet.messages';
        this._storeName = 'messages';
        this._version = 1;
        this._db = null;

        this._initDb();
    }

    /**
     * Initializes the IndexedDB database and object store.
     * @private
     */
    _initDb() {
        const request = indexedDB.open(this._dbName, this._version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(this._storeName)) {
                const store = db.createObjectStore(this._storeName, { keyPath: 'id' });
                store.createIndex('action', 'action', { unique: false });
                store.createIndex('domain', 'domain', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('from', 'from', { unique: false });
                store.createIndex('recipient', 'recipient', { unique: false });
                store.createIndex('read', 'read', { unique: false });
                store.createIndex('message', 'message', { unique: false });
                store.createIndex('delivery', 'delivery', { unique: false });
                store.createIndex('broadcast', 'broadcast', { unique: false });
                store.createIndex('activate', 'activate', { unique: false });
                store.createIndex('wakeup', 'wakeup', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            this._db = event.target.result;
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
        };
    }

    /**
     * Executes a callback function with the specified object store in the given mode.
     * @private
     * @param {string} mode - The transaction mode ('readonly' or 'readwrite').
     * @param {function} callback - The callback function to execute with the object store.
     * @returns {Promise} A promise that resolves with the result of the callback.
     */
    _withStore(mode, callback) {
        return new Promise((resolve, reject) => {
            if (!this._db) {
                const request = indexedDB.open(this._dbName, this._version);
                request.onsuccess = () => {
                    this._db = request.result;
                    const tx = this._db.transaction(this._storeName, mode);
                    const store = tx.objectStore(this._storeName);
                    resolve(callback(store, tx));
                };
                request.onerror = e => reject(e.target.error);
            } else {
                const tx = this._db.transaction(this._storeName, mode);
                const store = tx.objectStore(this._storeName);
                resolve(callback(store, tx));
            }
        });
    }

    /**
     * Adds a message to the IndexedDB store if it doesn't already exist.
     * @param {Object} message - The message to add.
     * @returns {Promise} A promise that resolves with the added message or the existing message if it already exists.
     */
    Add(message) {
        return this.Get({ filter: { id: message.id } }).then(existing => {
            if (existing.length > 0) {
                console.log(`Message with ID ${message.id} already exists`);
                return message;
            }
            return this._withStore('readwrite', (store) => {
                store.add(message);
                return message;
            });
        });
    }

    /**
     * Updates a message in the IndexedDB store.
     * @param {Object} message - The message to update.
     * @param {number} id - The ID of the message to update.
     * @returns {Promise} A promise that resolves with the updated message or rejects if the message is not found.
     */
    Update(message, id) {
        return new Promise((resolve, reject) => {
            this.Get({filter: {id: id}}).then((messages) => {            
                if(messages.length == 0) {
                    reject('Message not found');
                    return;
                }

                let msg = messages[0];
                msg = Object.assignRecursive(message, msg);

                this._withStore('readwrite', (store) => {
                    store.put(msg);
                    resolve(msg);
                });
            });
            
        })
    }

    /**
     * Stores multiple messages in the IndexedDB store.
     * @param {Array} messages - The messages to store.
     * @returns {Promise} A promise that resolves with the stored messages.
     */
    Store(messages) {
        return this._withStore('readwrite', (store) => {
            messages.forEach(msg => store.put(msg));
            return messages;
        });
    }

    /**
     * Retrieves messages from the IndexedDB store based on the provided options.
     * @param {Object} options - Options for retrieving messages.
     * @param {Array|string} [options.order=['date']] - The fields to order the results by.
     * @param {string} [options.direction='asc'] - The direction of sorting ('asc' or 'desc').
     * @param {Object|Array} [options.filter={}] - The filter criteria for retrieving messages.
     * @param {number} [options.page=1] - The page number for pagination.
     * @param {number} [options.pagesize=100] - The number of messages per page.
     * @returns {Promise<Array>} A promise that resolves with the retrieved messages.
     */
    Get(options = {}) {
        options.order = options.order ?? ['date'];
        options.direction = options.direction ?? 'asc';
        options.filter = options.filter ?? {};
        options.page = options.page ?? 1;
        options.pagesize = options.pagesize ?? 100;

        if(!Array.isArray(options.order)) {
            options.order = [options.order];
        }
        
        let filterString = '';
        if(options.filter && (Object.isObject(options.filter) && Object.countKeys(options.filter) > 0 || Array.isArray(options.filter) && options.filter.length > 0)) {
            filterString = window.convertFilterToString(options.filter);
        }

        return this._withStore('readonly', (store) => {
            return new Promise((resolve, reject) => {
                const result = [];
                const req = store.openCursor();
                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {

                        const row = cursor.value;
                        let res = !!filterString;
                        if(filterString) {
                            eval('res = ' + filterString + ';');
                        }
                        if(res) {
                            result.push(row);
                        }
                        cursor.continue();
                        
                    } else {

                        result.sort((a, b) => {
                            const akey = options.order.map(v => a[v]).join('');
                            const bkey = options.order.map(v => b[v]).join('');
                            if(options.direction === 'desc') {
                                return akey < bkey ? 1 : (akey > bkey ? -1 : 0);
                            } else {
                                return akey < bkey ? -1 : (akey > bkey ? 1 : 0);
                            }
                        });

                        if(options.page > 0) {
                            const offset = (options.page - 1) * options.pagesize;
                            const paged = result.slice(offset, offset + options.pagesize);
                            resolve(paged);
                        } else {
                            resolve(result);
                        }

                    }
                };
                req.onerror = e => reject(e.target.error);
            });
        });
    }

    /**
     * Clears all messages from the IndexedDB store.
     * @returns {Promise} A promise that resolves when the store is cleared.
     */
    Clear() {
        return this._withStore('readwrite', (store) => {
            store.clear();
        });
    }

    /**
     * Deletes messages from the IndexedDB store based on the provided filter options.
     * @param {Object} options - Options for deleting messages.
     * @param {Object|Array} [options.filter={}] - The filter criteria for deleting messages.
     * @returns {Promise} A promise that resolves when the messages are deleted.
     */
    Delete(options) {
        
        let filterString = '';
        if(options.filter && (Object.isObject(options.filter) && Object.countKeys(options.filter) > 0 || Array.isArray(options.filter) && options.filter.length > 0)) {
            filterString = window.convertFilterToString(options.filter);
        }

        return this._withStore('readwrite', (store) => {
            return new Promise((resolve, reject) => {
                const req = store.openCursor();
                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        const row = cursor.value;
                        let res = !!filterString;
                        if(filterString) {
                            eval('res = ' + filterString + ';');
                        }
                        if(res) {
                            cursor.delete();
                        }
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };
                req.onerror = e => reject(e.target.error);
            });
        });
    }

}
