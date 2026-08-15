/**
 * Manages IndexedDB operations.
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Web
 */
Colibri.Web.IndexDB = class extends Colibri.Events.Dispatcher {
    
    /**
     * @type {IDBDatabase|null} _db - The IndexedDB database instance.
     * @private
     */
    _db = null;

    /**
     * @type {IDBTransaction|null} _lastTransaction - The last transaction performed on the database.
     * @private
     */
    _lastTransaction = null;

    /**
     * @type {string|null} _name - The name of the IndexedDB.
     * @private
     */
    _name = null;

    /**
     * @type {number|null} _version - The version of the IndexedDB.
     * @private
     */
    _version = null;

    /**
     * Initializes a new instance of the IndexedDB class.
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
     * @returns {void}
     * @public
     * @example
     * ```
     * /// Open the IndexedDB
     * /// Dispatches events based on the database state (e.g., DatabaseDoesNotExists, DatabaseVersionDoesNotExists, DatabaseOpened, DatabaseOpenError)
     * App.IndexDB.Open();
     * ```
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
     * @public
     * @example
     * ```
     * /// Check if a store named 'myStore' exists in the database
     * const exists = App.IndexDB.StoreExists('myStore');
     * console.log(exists); // true or false
     * ```
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
     * @public
     * @example
     * ```
     * /// Create a new store named 'myStore' with keyPath 'id', autoIncrement set to true, and an index on 'name'
     * const store = App.IndexDB.CreateStore('myStore', 'id', true, [{name: 'nameIndex', keyPath: 'name', unique: false}]);
     * ```
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
     * @public
     * @example
     * ```
     * /// Create a new index named 'nameIndex' for the store 'myStore' with key 'name', unique set to false, and multiEntry set to false
     * const index = App.IndexDB.CreateIndex('myStore', 'nameIndex', 'name', false, false);
     * ```
     */
    CreateIndex(name, indexName, key, unique = false, multiEntry = false) {
        const store = this._db.objectStore(name);
        const options = {unique: unique, multiEntry: multiEntry};
        return store.createIndex(indexName, key, options);
    }

    /**
     * Deletes a store from the database.
     * @param {string} name - The name of the store to delete.
     * @public
     * @example
     * ```
     * /// Delete the store named 'myStore' from the database
     * App.IndexDB.DeleteStore('myStore');
     * ```
     */
    DeleteStore(name) {
        return this._db.deleteObjectStore(name);
    }

    /**
     * Adds data to a specified store in the database.
     * @param {string} storeName - The name of the store.
     * @param {object} dataObject - The data object to add.
     * @returns {Promise} - A promise that resolves with the result of the operation.
     * @public
     * @async
     * @example
     * ```
     * /// Add data to the store named 'myStore'
     * const result = await App.IndexDB.AddData('myStore', {id: 1, name: 'John Doe'});
     * console.log(result); // The result of the add operation
     * ```
     */
    AddData(storeName, dataObject) {
        return new Promise((resolve, reject) => {
            if(!this._db) {
                reject('Db is not opened');
            }
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
     * @async
     * @public
     * @example
     * ```
     * /// Update data in the store named 'myStore'
     * const result = await App.IndexDB.UpdateData('myStore', {id: 1, name: 'Jane Doe'});
     * console.log(result); // The result of the update operation
     * ```
     */
    UpdateData(storeName, dataObject) {
        return new Promise((resolve, reject) => {
            if(!this._db) {
                reject('Db is not opened');
            }
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
     * @async
     * @public
     * @example
     * ```
     * /// Retrieve data from the store named 'myStore' by its ID
     * const data = await App.IndexDB.GetDataById('myStore', 1);
     * console.log(data); // The retrieved data object
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * /// Retrieve data from the store named 'myStore' within the range of keys from 1 to 10
     * const data = await App.IndexDB.GetDataByRange('myStore', 1, 10);
     * console.log(data); // The retrieved data objects within the specified range
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * /// Retrieve keys from the store named 'myStore' within the range of keys from 1 to 10
     * const keys = await App.IndexDB.GetKeysByRange('myStore', 1, 10);
     * console.log(keys); // The retrieved keys within the specified range
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * /// Retrieve data from the store named 'myStore' using the index 'nameIndex' with key 'John Doe'
     * const data = await App.IndexDB.GetDataByIndex('myStore', 'nameIndex', 'John Doe');
     * console.log(data); // The retrieved data objects matching the specified index and key
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * /// Retrieve data from the store named 'myStore' using the index 'nameIndex' within the range of keys from 'A' to 'Z'
     * const data = await App.IndexDB.GetDataByIndexRange('myStore', 'nameIndex', 'A', 'Z');    
     * console.log(data); // The retrieved data objects matching the specified index and key range
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * /// Retrieve the key of a data entry in the store named 'myStore' using the index 'nameIndex' with key 'John Doe'    
     * const key = await App.IndexDB.GetId('myStore', 'nameIndex', 'John Doe');
     * console.log(key); // The retrieved key of the data entry matching the specified index and key
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * /// Delete a data entry in the store named 'myStore' by its ID
     * await App.IndexDB.DeleteById('myStore', 1);
     * console.log('Data entry deleted successfully');
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * /// Delete data entries in the store named 'myStore' using the index 'nameIndex' with key 'John Doe'
     * await App.IndexDB.DeleteByIndex('myStore', 'nameIndex', 'John Doe');
     * console.log('Data entries deleted successfully');
     * ```
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
            request.onerror = () => {
                reject(request.error);
            };
        });
    }


}