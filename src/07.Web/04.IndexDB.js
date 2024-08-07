/**
 * Manages IndexedDB operations.
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Web
 */
Colibri.Web.IndexDB = class extends Colibri.Events.Dispatcher {
    
    _db = null;
    _lastTransaction = null;
    _name = null;
    _version = null;

    /**
     * @constructor
     * @param {string} name - The name of the IndexedDB.
     * @param {number} version - The version of the IndexedDB.
     */
    constructor(name, version) {
        super();

        this._name = name;
        this._version = version;

        if (!('indexedDB' in window)) {
            throw new Error('IndexDB does not supported in your browser');
        }

        this.RegisterEvent('DatabaseDoesNotExists', false, 'When database is not exists');
        this.RegisterEvent('DatabaseVersionDoesNotExists', false, 'When the version is not found');
        this.RegisterEvent('DatabaseTransactionComplete', false, 'When transaction is successed');
        this.RegisterEvent('DatabaseTransactionError', false, 'When transaction is not success');
        this.RegisterEvent('DatabaseOpened', false, 'When database is opened');
        this.RegisterEvent('DatabaseOpenError', false, 'When database has open error');

    }
    
    /**
     * Opens the IndexedDB.
     */
    Open() {
        const request = window.indexedDB.open(this._name, this._version);
        request.onupgradeneeded = (event) => {
            console.log('version change');
            this._db = request.result;
            if(event.oldVersion) {
                this.Dispatch('DatabaseVersionDoesNotExists', {version: event.oldVersion});
            }
            else {
                // базы нет нужно создать
                this.Dispatch('DatabaseDoesNotExists', {});
            }
        };
        
        request.onerror = () => {
            this.Dispatch('DatabaseOpenError', {error: request.error}); 
        };
        
        request.onsuccess = () => {
            this._db = request.result;
            this.Dispatch('DatabaseOpened', {});
        };
    }

    /**
     * Checks if a store exists in the database.
     * @param {string} name - The name of the store.
     * @returns {boolean} - True if the store exists, false otherwise.
     */
    StoreExists(name) {
        return this._db.objectStoreNames.contains(name);
    }

    /**
     * Creates a new store in the database.
     * @param {string} name - The name of the store.
     * @param {string} keyPath - The key path for the store.
     * @param {boolean} autoIncrement - Whether the store should auto increment keys.
     * @param {array} indices - Array of index objects to create for the store.
     * @returns {object} - The newly created store.
     */
    CreateStore(name, keyPath = 'id', autoIncrement = false, indices = []) {
        const store = this._db.createObjectStore(name, {keyPath: keyPath, autoIncrement: autoIncrement});
        for(const index of indices) {
            store.createIndex(index.name, index.keyPath, {unique: index.unique, multiEntry: index.multiEntry});
        }
        return store;
    }

    /**
     * Creates a new index for a store in the database.
     * @param {string} name - The name of the store.
     * @param {string} indexName - The name of the index.
     * @param {string} key - The key for the index.
     * @param {boolean} unique - Whether the index should be unique.
     * @param {boolean} multiEntry - Whether the index should allow multiple entries for a key.
     * @returns {object} - The newly created index.
     */
    CreateIndex(name, indexName, key, unique = false, multiEntry = false) {
        const store = this._db.objectStore(name);
        const options = {unique: unique, multiEntry: multiEntry};
        return store.createIndex(indexName, key, options);
    }

    /**
     * Deletes a store from the database.
     * @param {string} name - The name of the store to delete.
     */
    DeleteStore(name) {
        return this._db.deleteObjectStore(name);
    }

    /**
     * Adds data to a specified store in the database.
     * @param {string} storeName - The name of the store.
     * @param {object} dataObject - The data object to add.
     * @returns {Promise} - A promise that resolves with the result of the operation.
     */
    AddData(storeName, dataObject) {
        return new Promise((resolve, reject) => {
            let transaction = this._db.transaction(storeName, "readwrite"); 
            let store = transaction.objectStore(storeName);
            let request = store.add(dataObject); 
            request.onsuccess = () => { 
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
            transaction.oncomplete = () => {
                this.Dispatch('DatabaseTransactionComplete', {transaction: transaction});
            };
            transaction.onerror = () => {
                this.Dispatch('DatabaseTransactionError', {transaction: transaction, error: transaction.error});
            };
        });
    }

    /**
     * Updates data in a specified store in the database.
     * @param {string} storeName - The name of the store.
     * @param {object} dataObject - The data object to update.
     * @returns {Promise} - A promise that resolves with the result of the operation.
     */
    UpdateData(storeName, dataObject) {
        return new Promise((resolve, reject) => {
            let transaction = this._db.transaction(storeName, "readwrite"); 
            let store = transaction.objectStore(storeName);
            let request = store.put(dataObject); 
            request.onsuccess = () => { 
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
            transaction.oncomplete = () => {
                this.Dispatch('DatabaseTransactionComplete', {transaction: transaction});
            };
            transaction.onerror = () => {
                this.Dispatch('DatabaseTransactionError', {transaction: transaction, error: transaction.error});
            };
        });
    }

    /**
     * Retrieves data from a specified store in the database by its ID.
     * @param {string} storeName - The name of the store.
     * @param {*} dataId - The ID of the data to retrieve.
     * @returns {Promise} - A promise that resolves with the retrieved data.
     */
    GetDataById(storeName, dataId) {
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(storeName, "readwrite"); 
            const store = transaction.objectStore(storeName);
            const request = store.get(dataId);
            request.onsuccess = () => {
                resolve(request.result);
            }
            request.onerror = () => {
                reject(request.error);
            }
        });
    }

    /**
     * Retrieves data from a specified store within a specified range of keys.
     * @param {string} storeName - The name of the store to retrieve data from.
     * @param {*} [idFrom=null] - The lower bound of the key range. If null, starts from the first key.
     * @param {*} [idTo=null] - The upper bound of the key range. If null, ends at the last key.
     * @returns {Promise} A Promise that resolves with the retrieved data or rejects with an error.
     */
    GetDataByRange(storeName, idFrom = null, idTo = null) {
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(storeName, "readwrite"); 
            const store = transaction.objectStore(storeName);
            let request = null;
            if(idFrom === null) {
                request = store.getAll(IDBKeyRange.upperBound(idTo));
            }
            else if(idTo === null) {
                request = store.getAll(IDBKeyRange.lowerBound(idFrom));
            }
            else if(idFrom !== null && idTo !== null) {
                request = store.getAll(IDBKeyRange.bound(idFrom, idTo));
            }
            if(!request) {
                reject('Bad request');
            }
            
            request.onsuccess = () => {
                resolve(request.result);
            }
            request.onerror = () => {
                reject(request.error);
            }
            transaction.oncomplete = () => {
                this.Dispatch('DatabaseTransactionComplete', {transaction: transaction});
            };
            transaction.onerror = () => {
                this.Dispatch('DatabaseTransactionError', {transaction: transaction, error: transaction.error});
            };
        });
    }

    /**
     * Retrieves keys from a specified store within a specified range of keys.
     * @param {string} storeName - The name of the store to retrieve keys from.
     * @param {*} [idFrom=null] - The lower bound of the key range. If null, starts from the first key.
     * @param {*} [idTo=null] - The upper bound of the key range. If null, ends at the last key.
     * @returns {Promise} A Promise that resolves with the retrieved keys or rejects with an error.
     */
    GetKeysByRange(storeName, idFrom = null, idTo = null) {
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(storeName, "readwrite"); 
            const store = transaction.objectStore(storeName);
            let request = null;
            if(idFrom === null) {
                request = store.getAllKeys(IDBKeyRange.upperBound(idTo));
            }
            else if(idTo === null) {
                request = store.getAllKeys(IDBKeyRange.lowerBound(idFrom));
            }
            else if(idFrom !== null && idTo !== null) {
                request = store.getAllKeys(IDBKeyRange.bound(idFrom, idTo));
            }
            if(!request) {
                reject('Bad request');
            }
            
            request.onsuccess = () => {
                resolve(request.result);
            }
            request.onerror = () => {
                reject(request.error);
            }
            transaction.oncomplete = () => {
                this.Dispatch('DatabaseTransactionComplete', {transaction: transaction});
            };
            transaction.onerror = () => {
                this.Dispatch('DatabaseTransactionError', {transaction: transaction, error: transaction.error});
            };
        });
    }

    /**
     * Retrieves data from a specified store using an index and a specified key.
     * @param {string} storeName - The name of the store to retrieve data from.
     * @param {string} indexName - The name of the index to use for retrieval.
     * @param {*} key - The key to use for data retrieval.
     * @returns {Promise} A Promise that resolves with the retrieved data or rejects with an error.
     */
    GetDataByIndex(storeName, indexName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(storeName, "readwrite"); 
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(key);
            request.onsuccess = () => {
                resolve(request.result);
            }
            request.onerror = () => {
                reject(request.error);
            }
            transaction.oncomplete = () => {
                this.Dispatch('DatabaseTransactionComplete', {transaction: transaction});
            };
            transaction.onerror = () => {
                this.Dispatch('DatabaseTransactionError', {transaction: transaction, error: transaction.error});
            };
        });
    }

    /**
     * Retrieves data from a specified store using an index and a specified range of keys.
     * @param {string} storeName - The name of the store to retrieve data from.
     * @param {string} indexName - The name of the index to use for retrieval.
     * @param {*} [keyFrom=null] - The lower bound of the key range. If null, starts from the first key.
     * @param {*} [keyTo=null] - The upper bound of the key range. If null, ends at the last key.
     * @returns {Promise} A Promise that resolves with the retrieved data or rejects with an error.
     */
    GetDataByIndexRange(storeName, indexName, keyFrom = null, keyTo = null) {
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(storeName, "readwrite"); 
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            let request = null;
            if(idFrom === null) {
                request = index.getAll(IDBKeyRange.upperBound(keyTo));
            }
            else if(idTo === null) {
                request = index.getAll(IDBKeyRange.lowerBound(keyFrom));
            }
            else if(idFrom !== null && idTo !== null) {
                request = index.getAll(IDBKeyRange.bound(keyFrom, keyTo));
            }
            if(!request) {
                reject('Bad request');
            }
            
            request.onsuccess = () => {
                resolve(request.result);
            }
            request.onerror = () => {
                reject(request.error);
            }
            transaction.oncomplete = () => {
                this.Dispatch('DatabaseTransactionComplete', {transaction: transaction});
            };
            transaction.onerror = () => {
                this.Dispatch('DatabaseTransactionError', {transaction: transaction, error: transaction.error});
            };
        });
    }

    /**
     * Retrieves the key of a data entry in a specified store using an index and a specified key.
     * @param {string} storeName - The name of the store to retrieve data from.
     * @param {string} indexName - The name of the index to use for retrieval.
     * @param {*} key - The key to use for data retrieval.
     * @returns {Promise} A Promise that resolves with the retrieved key or rejects with an error.
     */
    GetId(storeName, indexName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(storeName, "readwrite"); 
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getKey(key);
            request.onsuccess = () => {
                resolve(request.result);
            }
            request.onerror = () => {
                reject(request.error);
            }
            transaction.oncomplete = () => {
                this.Dispatch('DatabaseTransactionComplete', {transaction: transaction});
            };
            transaction.onerror = () => {
                this.Dispatch('DatabaseTransactionError', {transaction: transaction, error: transaction.error});
            };
        });
    }

    /**
     * Deletes a data entry in a specified store by its ID.
     * @param {string} storeName - The name of the store to delete data from.
     * @param {*} id - The ID of the data entry to delete.
     * @returns {Promise} A Promise that resolves when the deletion is successful or rejects with an error.
     */
    DeleteById(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(storeName, "readwrite"); 
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
            transaction.oncomplete = () => {
                this.Dispatch('DatabaseTransactionComplete', {transaction: transaction});
            };
            transaction.onerror = () => {
                this.Dispatch('DatabaseTransactionError', {transaction: transaction, error: transaction.error});
            };
        });
    }

    /**
     * Deletes data entries in a specified store using an index and a specified key.
     * @param {string} storeName - The name of the store to delete data from.
     * @param {string} indexName - The name of the index to use for deletion.
     * @param {*} key - The key to use for data deletion.
     * @returns {Promise} A Promise that resolves when the deletion is successful or rejects with an error.
     */
    DeleteByIndex(storeName, indexName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(storeName, "readwrite"); 
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.openCursor(key);
            request.onsuccess = () => {
                let cursor = request.result;
                if(cursor) {
                    cursor.delete();
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
        });
    }


}