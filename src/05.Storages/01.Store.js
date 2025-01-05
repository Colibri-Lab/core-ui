/**
 * Represents a storage class that extends Colibri.Events.Dispatcher.
 * Manages storage of data and provides methods for querying and updating data.
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Storages
 */
Colibri.Storages.Store = class extends Colibri.Events.Dispatcher {

    /**
     * Creates an instance of Colibri.Storages.Store.
     * @param {string} name - The name of the store.
     * @param {Object} [data={}] - The initial data for the store.
     * @param {Object} [parent=null] - The parent store, if any.
     * @param {boolean} [permanent=false] - Indicates whether the store data should be kept permanently.
     */
    constructor(name, data = {}, parent = null, permanent = false) {
        super('Store');

        this._name = name;
        this._parent = parent;
        this._data = data;

        this._pathHandlers = {};
        this._pathLoaders = {};

        this.RegisterEvents();
        this.RegisterEventHandlers();

        this._permanent = permanent ?? false;
        if(this._permanent) {
            App.Db.AddHandler('DatabaseDoesNotExists', (event, args) => {
                App.Db.CreateStore(this._name, '__domain');
            });
            App.Db.AddHandler('DatabaseOpened', (event, args) => {
                this.RetreiveFromPermanentStore();
            });
            App.Db.Open();
        }

    }

    destructor() {
        super.destructor();
        this.Dispose();
    }

    Dispose() {

        this._owner = null;
        this._parent = null;
        this._data = null;

        this._pathHandlers = null;
        this._pathLoaders = null;
        
    }

    /**
     * Saves the store data in the permanent storage.
     */
    KeepInPermanentStore() {
        const __domain = location.hostname;
        let savingData = this.ExportData();
        savingData = Object.assign(savingData, {__domain: __domain});
        App?.Db?.GetDataById(this._name, __domain).then(() => {
            App.Db.UpdateData(this._name, savingData);
        }).catch(() => {
            App.Db.AddData(this._name, savingData);
        }).finally(() => {
            this.Dispatch('StoreKeeped', {});
        });
    }

    /**
     * Retrieves store data from the permanent storage.
     */
    RetreiveFromPermanentStore() {
        if(App.Db.StoreExists(this._name)) {
            this._data = App?.Db?.GetDataById(this._name, location.hostname);
            Colibri.Common.StartTimer(this._name + '-store-dump', 15000, () => {
                this.KeepInPermanentStore();
            });
            this.Dispatch('StoreRetreived', {});
            this.Dispatch('StoreUpdated', {});
        }
    }
    
    /**
     * Exports store data.
     * @param {boolean} [fullData=false] - Indicates whether to export full data recursively.
     * @returns {Object} The exported data.
     */
    ExportData(fullData = false) {

        const newData = {};

        Object.forEach(this._data, (name, value) => {
            if(value instanceof Colibri.Storages.Store) {
                if(fullData) {
                    newData[name] = value.ExportData();
                }
            } else {
                newData[name] = Object.cloneRecursive(value);
            }
        });

        return newData;
    }

    /**
     * Indicates whether the store is permanent.
     * @type {boolean}
     */
    get permanent() {
        return this._permanent;
    }

    /**
     * Sets the permanence of the store.
     * @type {boolean}
     */
    set permanent(value) {
        this._permanent = value;
        if(!this._permanent) {
            Colibri.Common.StopTimer(this._name + '-store-dump');
        }
    }

    /**
     * Gets the owner module object.
     * @type {Object}
     */
    get owner() {
        return this._owner;
    }
    /**
     * Sets the owner module object.
     * @type {Object}
     */
    set owner(value) {
        this._owner = value;
    }
    
    /**
     * Clears data at the specified path or the entire store if no path is provided.
     * @param {string} [path] - The path to clear.
     */
    Clear(path) {
        if(!path) {
            this._data = {};
        }
        this.Set(path, null);
    }
    
    /**
     * Gets the name of the store.
     * @returns {string} The name of the store.
     */
    get name() {
        return this._name;
    }

    /**
     * Registers events for the store.
     */
    RegisterEvents() {
        this.RegisterEvent('StoreUpdated', true, 'When store data is updated');
        this.RegisterEvent('StoreChildUpdated', true, 'When child store is updated');
        this.RegisterEvent('StoreLoaderCrushed', true, 'When store loader crushed');
        this.RegisterEvent('StoreRetreived', true, 'When store is retreived from permanent');
        this.RegisterEvent('StoreKeeped', true, 'When store is keeped to permanent');
    }

    /**
     * Registers event handlers for the store.
     */
    RegisterEventHandlers() {
        if(this._parent) {
            this.AddHandler('StoreUpdated', (event, args) => {
                this._parent.Dispatch('StoreUpdated', {child: this});
            }); 
        }
    }

    /**
     * Adds a child store.
     * @param {string} path - The path to the child store.
     * @param {object} [data={}] - The data for the child store.
     * @param {object} [owner=null] - The owner module object.
     * @param {boolean} [permanent=false] - Indicates whether the child store is permanent.
     * @returns {Colibri.Storages.Store} The newly added child store.
     */
    AddChild(path, data = {}, owner = null, permanent = false) {
        let paths = path.split('.');
        const newStore = new Colibri.Storages.Store(paths[paths.length - 1], data, this, permanent);
        newStore.owner = owner;
        this.Set(path, newStore);
        return newStore;
    }

    /**
     * Retrieves the child store at the specified path.
     * @param {string} path - The path to the child store.
     * @returns {object} The child store object along with its path.
     */
    GetChild(path) {
        let p = path.split('.');
        let first = p.shift();
        if (first !== this._name) {
            throw new Error('path must start with the name of store "' + this._name + '" you queried "' + path + '"');
        }

        if (p.length === 0) {
            return null;
        }

        let data = this._data;
        if(!data) {
            return null;
        }

        while(p.length > 0) {
            first = p.shift();
            if((data[first] ?? undefined) !== undefined) {
                data = data[first];
                if(data instanceof Colibri.Storages.Store) {
                    return {child: data, path: (first + (p.length > 0 ? '.' + p.join('.') : ''))};
                }
            }
            else {
                break;
            }
        }

        return null;
    }

    /**
     * Adds a path loader.
     * @param {string} path - The path to add the loader.
     * @param {function|string} loader - The loader function or string indicating the method.
     * @param {object} [params={}] - Additional parameters for the loader.
     * @returns {Colibri.Storages.Store} The store object.
     */
    AddPathLoader(path, loader, params = {}) {
        if(this._pathLoaders[path]) {
            throw new Error('Path loader is Registered')
        }

        if(typeof loader == 'string') {
            // значит это Module:Controller.Method
            const parts = loader.split(':');
            const module = eval(parts[0]);
            loader = () => module.Call(parts[1].split('.')[0], parts[1].split('.')[1], Object.assign(params, {__defered: true}));
        }

        this._pathLoaders[path] = {loader: loader, loading: false, loaded: false};
        return this;
    }

    /**
     * Adds a path handler for the specified path.
     * @param {string|string[]} path - The path or an array of paths for which the handler is registered.
     * @param {Function|Array} handler - The handler function or an array containing the respondent and handler function.
     * @param {boolean} prepend - Indicates whether the handler should be added at the beginning (true) or end (false) of the handlers list.
     * @returns {Colibri.Storages.Store} The store instance.
     */
    AddPathHandler(path, handler, prepend) {

        if(Array.isArray(path)) {
            for(const p of path) {
                this.AddPathHandler(p, handler, prepend);
            }
            return this;
        }

        const childStoreData = this.GetChild(path);
        if(childStoreData) {
            return childStoreData.child.AddPathHandler(childStoreData.path, handler, prepend);
        }

        let respondent = this;
        if(Array.isArray(handler)) {
            respondent = handler[0];
            handler = handler[1];
        }

        if(respondent instanceof Colibri.UI.Component) {
            respondent.AddHandler('ComponentDisposed', (event, args) => {
                this.RemovePathHandler(path, respondent, handler);
            });
        }

        if (path instanceof Array) {
            path.forEach((p) => {
                this.AddPathHandler(p, handler, prepend);
            });
        } else {

            if (!this._pathHandlers[path]) {
                this._pathHandlers[path] = [];
            }

            for (let i = 0; i < this._pathHandlers[path].length; i++) {
                const h = this._pathHandlers[path][i];
                if (h === handler) {
                    this._pathHandlers[path].splice(i, 1);
                }
            }

            const handlerObject = { handler: handler, respondent: respondent };
            if (prepend) {
                this._pathHandlers[path].splice(0, 0, handlerObject);
            } else {
                this._pathHandlers[path].push(handlerObject);
            }
        }

        return this;
    }

    /**
     * Removes a path handler for the specified path.
     * @param {string} path - The path for which the handler should be removed.
     * @param {Object} respondent - The respondent object associated with the handler.
     * @param {Function} handler - The handler function to be removed.
     * @returns {Colibri.Storages.Store} The store instance.
     */
    RemovePathHandler(path, respondent, handler) {

        const childStoreData = this.GetChild(path);
        if(childStoreData) {
            return childStoreData.child.RemovePathHandler(childStoreData.path, respondent, handler);
        }

        if(!this._pathHandlers) {
            return this;
        }

        const handlers = this._pathHandlers[path];
        if(!handlers) {
            return this;
        }
        for (let i = 0; i < handlers.length; i++) {
            const h = handlers[i];
            if (h.handler == handler && h.respondent == respondent) {
                handlers.splice(i, 1);
                break;
            }
        }
        this._pathHandlers[path] = handlers;
        return this;
    }

    /**
     * Dispatches events along the specified path.
     * @param {string} path - The path along which events should be dispatched.
     * @returns {boolean} True if all event handlers were executed successfully, otherwise false.
     */
    DispatchPath(path) {

        const childStoreData = this.GetChild(path);
        if(childStoreData) {
            return childStoreData.child.DispatchPath(childStoreData.path);
        }

        const keys = Object.keys(this._pathHandlers);
        for(let j=0; j<keys.length; j++) {
            if(path.indexOf(keys[j]) === 0 || keys[j].indexOf(path) === 0) {
                const pathHandlers = this._pathHandlers[keys[j]];

                let queryPath = keys[j];
                let queryParam = null;

                let queryData = this._parsePathIfHasParam(queryPath);
                if(queryData[1]) {
                    queryPath = queryData[0];
                    queryParam = queryData[1];
                }

                const data = this.Query(queryPath, queryParam);

                for(let i=0; i<pathHandlers.length; i++) {

                    const handlerObject = pathHandlers[i];
                    if (handlerObject && handlerObject.handler.apply(handlerObject.respondent, [data, queryPath]) === false) {
                        return false;
                    }
        
                }        

            }
        }

        return true;

    }

    /**
     * Checks if the loader associated with the specified path has been executed.
     * @param {string} path - The path for which to check if the loader has been executed.
     * @returns {boolean} True if the loader has been executed or if the path doesn't have a loader, otherwise false.
     */
    IsLoaderExecuted(path) {
        
        const childStore = this.GetChild(path);
        if(childStore) {
            return childStore.child.IsLoaderExecuted(childStore.path, nodispatch, param);
        }
        const loader = this._pathLoaders[path];
        return !loader || loader.loaded;

    }

    /**
     * Reloads the data associated with the specified path, optionally dispatching events after reloading.
     * @param {string} path - The path to reload data for.
     * @param {boolean} [nodispatch=true] - Whether to dispatch events after reloading (default: true).
     * @param {string|int|null} [param=null] - Additional parameter for the reload operation (default: null).
     * @returns {Promise} A promise that resolves when the reload operation is complete.
     */
    async Reload(path, nodispatch = true, param = null) {
        const childStore = this.GetChild(path);
        if(childStore) {
            return childStore.child.Reload(childStore.path, nodispatch, param);
        }

        const loader = this._pathLoaders[path];
        if(!loader) {
            return this.Query(path + (param && param.indexOf('=') === -1 ? '.' + param : ''), param && param.indexOf('=') !== -1 ? param : null);
        }

        if(loader.loading) {
            //Уже загружается, ждем пока завершится
            await Colibri.Common.Wait(() => !loader.loading);
            return this.Query(path + (param && param.indexOf('=') === -1 ? '.' + param : ''), param && param.indexOf('=') !== -1 ? param : null);
        }

        loader.loading = true;
        try {
            let response = await loader.loader(param);
            if(response && response.result) {
                this.Set(path, response.result, nodispatch);
                return this.Query(path + (param && param.indexOf('=') === -1 ? '.' + param : ''), param && param.indexOf('=') !== -1 ? param : null);
            } else {
                return null;
            }
        }
        finally {
            loader.loading = false;
            loader.loaded = true;
        }
        
        
    }

    /**
     * Asynchronously retrieves data from the storage using PathLoaders.
     * @param {string} path - The path to the object.
     * @param {string|int|null} [param=null] - Additional path.
     * @param {boolean} [reload=false] - Whether to force reload the data (default: false).
     * @returns {Promise<object>} A promise that resolves with the retrieved data.
     */
    async AsyncQuery(path, param = null, reload = false) {

        let data = this._parsePathIfHasParam(path);
        if(data[1]) {
            path = data[0];
            param = data[1];
        }

        const res = this.Query(path + (param && param.indexOf('=') === -1 ? '.' + param : ''), param && param.indexOf('=') !== -1 ? param : null);
        if(!reload && ((Object.isObject(res) && Object.countKeys(res) > 0) || (Array.isArray(res) && res.length > 0))) {
            return res;
        }

        return this.Reload(path, false, param);
    }

    /**
     * Retrieves data from the storage based on the provided path and optional query parameters.
     * @param {string} path - The path to the object.
     * @param {string|null} [queryList=null] - Optional query parameters in the format "field=value".
     * @returns {object} The retrieved data.
     */
    Query(path, queryList = null) {

        let p = path.split('.');
        let first = p.shift();
        if (first !== this._name) {
            throw new Error('path must start with the name of store "' + this._name + '" you queried "' + path + '"');
        }

        let data = this._data;
        if (!data || p.length === 0) {
            return data;
        }

        while(p.length > 0) {
            first = p.shift();
            if((data[first] ?? undefined) !== undefined) {
                data = data[first];
                if(data instanceof Colibri.Storages.Store) {
                    return data.Query(first + '.' + p.join('.'), queryList);
                }
            }
            else {
                data = {};
                break;
            }

        }

        if(queryList) {
            // queryList = field=value
            const queryParts = queryList.split('=');
            data = Array.isArray(data) ? data.filter(v => v[queryParts[0]] == queryParts[1]) : []; 
            if(data.length === 1) {
                data = data[0];
            }
        }

        return data;

    }

    /**
     * Sets data at the specified path in the storage.
     * @param {string} path - The path where the data will be set.
     * @param {any} d - The data to be set.
     * @param {boolean} [nodispatch=false] - Whether to dispatch events after setting the data.
     * @returns {object} The updated storage object.
     */
    Set(path, d, nodispatch = false) {

        let p = path.split('.');
        let first = p.shift();
        if (first !== this._name) {
            throw new Error('path must start with the name of store "' + this._name + '" you queried "' + path + '"');
        }

        if (p.length === 0) {
            this._data = d;
            return this;
        }

        let realpath = 'this._data';
        let data = this._data || {};
        for(let i=0; i<p.length; i++) {
            if((data[p[i]] ?? undefined) === undefined) {
                data[p[i]] = {};
            }
            realpath += '["' + p[i] + '"]';
            data = data[p[i]];
            if(data instanceof Colibri.Storages.Store) {
                return data.Set(first + '.' + p.join('.'));
            }
        }

        if(d !== null) {
            if(this._data === null) {
                this._data = {};
            }
            eval(realpath + ' = d;');
        }
        else {
            eval('delete ' + realpath + ';');
        }

        if(!nodispatch) {
            this.DispatchPath(path);
            this.Dispatch('StoreUpdated', {path: path, data: d});
        }
        return this;

    }

    /**
     * Updates a list in the storage based on search criteria and sorting options.
     * @param {string} path - The path of the list in the storage.
     * @param {string} searchField - The field used for searching within the list.
     * @param {any} [searchValue=null] - The value to search for within the list.
     * @param {any} [newData=null] - The new data to replace the existing data that matches the search criteria.
     * @param {string} [sortField=null] - The field used for sorting the list.
     * @param {string} [sortOrder='asc'] - The order in which the list should be sorted ('asc' for ascending or 'desc' for descending).
     * @param {boolean} [insertIfNotExists=true] - Whether to insert the new data if no matching entry is found in the list.
     * @param {string} [incrementIfInserted=''] - The path where the length of the list should be incremented if a new entry is inserted.
     * @returns {array} The updated list.
     */
    UpdateList(path, searchField, searchValue = null, newData = null, sortField = null, sortOrder = 'asc', insertIfNotExists = true, incrementIfInserted = '') {
        let list = this.Query(path);
        if(!Array.isArray(list)) {
            list = [];
        }
        const oldLength = list.length;
        list = Array.replaceObject(list, searchField, searchValue, newData, insertIfNotExists);
        if(sortField) {
            list.sort((a, b) => {
                if(a[sortField] > b[sortField]) {
                    return sortOrder === 'asc' ? 1 : -1;
                }
                else if(a[sortField] < b[sortField]) {
                    return sortOrder === 'asc' ? -1 : 1;
                }
                return 0;
            });
        }
        if(oldLength != list.length && incrementIfInserted) {
            this.Set(incrementIfInserted, list.length, true);
        }
        this.Set(path, list);
        return list;
    }

    /**
     * Updates the list in the storage by intersecting it with the provided values based on the specified search field.
     * @param {string} path - The path of the list in the storage.
     * @param {string} searchField - The field used for searching within the list.
     * @param {Array} values - The array of values to intersect with the list.
     */
    IntersectList(path, searchField, values) {
        let list = this.Query(path);
        if(!Array.isArray(list)) {
            list = [];
        }

        for(const item of values) {
            list = Array.replaceObject(list, searchField, item[searchField], item, true);
        }

        this.Set(path, list);

    }

    /**
     * Adds a page of items to the list in the storage.
     * @param {string} path - The path of the list in the storage.
     * @param {number} page - The page number.
     * @param {Array} pageItems - The items to add to the list.
     * @returns {Array} The updated list after adding the page items.
     */
    ListAddPage(path, page, pageItems) {
        let list = this.Query(path);
        if(!Array.isArray(list) || page === 1) {
            list = [];
        }
        list = list.concat(pageItems);
        this.Set(path, list);
        return list;
    }

    /**
     * Sorts the list in the storage based on the specified field and sort order.
     * @param {string} path - The path of the list in the storage.
     * @param {string} sortField - The field used for sorting the list.
     * @param {string} [sortOrder='asc'] - The order in which the list should be sorted ('asc' for ascending or 'desc' for descending).
     * @returns {Array} The sorted list.
     */
    SortList(path, sortField, sortOrder = 'asc') {
        let list = this.Query(path);
        if(!Array.isArray(list)) {
            list = [];
        }
        list.sort((a, b) => {
            if(a[sortField] > b[sortField]) {
                return sortOrder === 'asc' ? 1 : -1;
            }
            else if(a[sortField] < b[sortField]) {
                return sortOrder === 'asc' ? -1 : 1;
            }
            return 0;
        });
        this.Set(path, list);
        return list;
    }

    /**
     * Queries the list in the storage based on the specified field and value.
     * @param {string} path - The path of the list in the storage.
     * @param {string} field - The field used for querying the list.
     * @param {any} value - The value to search for within the list.
     * @returns {any} The queried data from the list.
     */
    QueryList(path, field, value) {
        let list = this.Query(path);
        if(!Array.isArray(list)) {
            list = [];
        }

        return Array.findObject(list, field, value);
    }

    /**
     * Parses the path if it contains a parameter enclosed in parentheses.
     * @param {string} path - The path to parse.
     * @returns {[string, string|null]} An array containing the parsed path and the parameter, or null if no parameter is found.
     * @private
     */
    _parsePathIfHasParam(path) {
        if(path.indexOf('(') === -1) {
            return [path, null];
        }
        path = path.replaceAll(')', '');
        return path.split('(');
    }

}