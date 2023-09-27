Colibri.Storages.Store = class extends Colibri.Events.Dispatcher {

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

    KeepInPermanentStore() {
        const __domain = location.hostname;
        let savingData = this.ExportData();
        savingData = Object.assign(savingData, {__domain: __domain});
        App.Db.GetDataById(this._name, __domain).then(() => {
            App.Db.UpdateData(this._name, savingData);
        }).catch(() => {
            App.Db.AddData(this._name, savingData);
        }).finally(() => {
            this.Dispatch('StoreKeeped', {});
        });
    }

    RetreiveFromPermanentStore() {
        if(App.Db.StoreExists(this._name)) {
            this._data = App.Db.GetDataById(this._name, location.hostname);
            Colibri.Common.StartTimer(this._name + '-store-dump', 15000, () => {
                this.KeepInPermanentStore();
            });
            this.Dispatch('StoreRetreived', {});
            this.Dispatch('StoreUpdated', {});
        }
    }
    
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
     * @type {Boolean}
     */
    get permanent() {
        return this._permanent;
    }

    /**
     * @type {Boolean}
     */
    set permanent(value) {
        this._permanent = value;
        if(!this._permanent) {
            Colibri.Common.StopTimer(this._name + '-store-dump');
        }
    }

    /**
     * Owner module object
     * @type {Object}
     */
    get owner() {
        return this._owner;
    }
    /**
     * Owner module object
     * @type {Object}
     */
    set owner(value) {
        this._owner = value;
    }
    
    Clear(path) {
        if(!path) {
            this._data = {};
        }
        this.Set(path, null);
    }
    
    get name() {
        return this._name;
    }

    RegisterEvents() {
        this.RegisterEvent('StoreUpdated', true, 'When store data is updated');
        this.RegisterEvent('StoreChildUpdated', true, 'When child store is updated');
        this.RegisterEvent('StoreLoaderCrushed', true, 'When store loader crushed');
        this.RegisterEvent('StoreRetreived', true, 'When store is retreived from permanent');
        this.RegisterEvent('StoreKeeped', true, 'When store is keeped to permanent');
    }

    RegisterEventHandlers() {
        if(this._parent) {
            this.AddHandler('StoreUpdated', (event, args) => {
                this._parent.Dispatch('StoreUpdated', {child: this});
            }); 
        }
    }

    AddChild(path, data = {}, owner = null, permanent = false) {
        let paths = path.split('.');
        const newStore = new Colibri.Storages.Store(paths[paths.length - 1], data, this, permanent);
        newStore.owner = owner;
        this.Set(path, newStore);
        return newStore;
    }

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

    AddPathLoader(path, loader, params = {}) {
        if(this._pathLoaders[path]) {
            throw new Error('Path loader is Registered')
        }

        if(typeof loader == 'string') {
            // значит это Module:Controller.Method
            const parts = loader.split(':');
            const module = eval(parts[0]);
            loader = () => module.Call(parts[1].split('.')[0], parts[1].split('.')[1], params);
        }

        this._pathLoaders[path] = {loader: loader, loading: false, loaded: false};
        return this;
    }

    AddPathHandler(path, handler, prepend) {

        if(Array.isArray(path)) {
            for(const p of path) {
                this.AddPathHandler(p, handler, prepend);
            }
            return this;
        }

        // let data = this._parsePathIfHasParam(path);
        // path = data[0];

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

    RemovePathHandler(path, respondent, handler) {
        for (let i = 0; i < this._pathHandlers[path].length; i++) {
            const h = this._pathHandlers[path][i];
            if (h.handler == handler && h.respondent == respondent) {
                this._pathHandlers[path].splice(i, 1);
                break;
            }
        }
        return this;
    }

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

    IsLoaderExecuted(path) {
        
        const childStore = this.GetChild(path);
        if(childStore) {
            return childStore.child.IsLoaderExecuted(childStore.path, nodispatch, param);
        }
        const loader = this._pathLoaders[path];
        return !loader || loader.loaded;

    }

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
                return param ? response.result[param] : response.result;    
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
     * Получает данные из хранилища в ассинхронном режиме, используются PathLoader-ы
     * @param {string} path путь к обьекту
     * @param {string|int|null} param доп путь
     * @returns {object}
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
            data = Array.findObject(data, queryParts[0], queryParts[1]);
        }

        return data;

    }

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
        let data = this._data;
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

    ListAddPage(path, page, pageItems) {
        let list = this.Query(path);
        if(!Array.isArray(list) || page === 1) {
            list = [];
        }
        list = list.concat(pageItems);
        this.Set(path, list);
        return list;
    }

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

    QueryList(path, field, value) {
        let list = this.Query(path);
        if(!Array.isArray(list)) {
            list = [];
        }

        return Array.findObject(list, field, value);
    }

    _parsePathIfHasParam(path) {
        if(path.indexOf('(') === -1) {
            return [path, null];
        }
        path = path.replaceAll(')', '');
        return path.split('(');
    }

}