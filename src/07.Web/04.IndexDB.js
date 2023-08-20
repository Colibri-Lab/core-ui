Colibri.Web.IndexDB = class extends Colibri.Events.Dispatcher {
    
    _db = null;
    _lastTransaction = null;
    _name = null;
    _version = null;

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

    StoreExists(name) {
        return this._db.objectStoreNames.contains(name);
    }

    CreateStore(name, keyPath = 'id', autoIncrement = false, indices = []) {
        const store = this._db.createObjectStore(name, {keyPath: keyPath, autoIncrement: autoIncrement});
        for(const index of indices) {
            store.createIndex(index.name, index.keyPath, {unique: index.unique, multiEntry: index.multiEntry});
        }
        return store;
    }

    CreateIndex(name, indexName, key, unique = false, multiEntry = false) {
        const store = this._db.objectStore(name);
        const options = {unique: unique, multiEntry: multiEntry};
        return store.createIndex(indexName, key, options);
    }

    DeleteStore(name) {
        return this._db.deleteObjectStore(name);
    }

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