Colibri.Storages.Store = class extends Colibri.Events.Dispatcher {

    constructor(name, data, parent) {
        super('Store');

        this._name = name;
        this._parent = parent;
        this._data = data;

        this._pathHandlers = {};
        this._pathLoaders = {};

        this.RegisterEvents();
        this.RegisterEventHandlers();

    }
    
    get name() {
        return this._name;
    }

    RegisterEvents() {
        this.RegisterEvent('StoreUpdated', true, 'Когда хранилище обновилось');
        this.RegisterEvent('StoreChildUpdated', true, 'Когда обновилось дочернее хранилище');
    }

    RegisterEventHandlers() {
        if(this._parent) {
            this.AddHandler('StoreUpdated', (event, args) => {
                this._parent.Dispatch('StoreUpdated', {child: this});
            }); 
        }
    }

    AddChild(path, data) {
        let paths = path.split('.');
        const newStore = new Colibri.Storages.Store(paths[paths.length - 1], data, this);
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
        while(p.length > 0) {
            first = p.shift();
            if(data[first] !== undefined) {
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

    AddPathLoader(path, loader) {
        if(this._pathLoaders[path]) {
            throw new Error('Path loader is Registered')
        }

        this._pathLoaders[path] = {loader: loader, loading: false, loaded: false};
        return this;
    }

    AddPathHandler(path, handler, prepend) {

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

            const handlerObject = { handler: handler, respondent: this };
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

                const data = this.Query(keys[j]);

                for(let i=0; i<pathHandlers.length; i++) {

                    const handlerObject = pathHandlers[i];
                    if (handlerObject && handlerObject.handler.apply(handlerObject.respondent, [data]) === false) {
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
            return this.Query(path + (param ? '.' + param : ''));
        }

        if(loader.loading) {
            //Уже загружается, ждем пока завершится
            await Colibri.Common.Wait(() => !loader.loading);
            return this.Query(path + (param ? '.' + param : ''));
        }

        loader.loading = true;
        try {
            let response = await loader.loader(param);
            this.Set(path + (param ? '.' + param : ''), response.result, nodispatch);
            return response.result;    
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
    async AsyncQuery(path, param = null) {

        const res = this.Query(path + (param ? '.' + param : ''));
        if((res instanceof Object && Object.countKeys(res) > 0) || (Array.isArray(res) && res.length > 0)) {
            return res;
        }

        return this.Reload(path, false, param);
    }

    Query(path) {

        let p = path.split('.');
        let first = p.shift();
        if (first !== this._name) {
            throw new Error('path must start with the name of store "' + this._name + '" you queried "' + path + '"');
        }

        let data = this._data;
        if (p.length === 0) {
            return data;
        }

        while(p.length > 0) {
            first = p.shift();
            if(data[first] !== undefined) {
                data = data[first];
                if(data instanceof Colibri.Storages.Store) {
                    return data.Query(first + '.' + p.join('.'));
                }
            }
            else {
                data = {};
                break;
            }

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
            if(data[p[i]] === undefined) {
                data[p[i]] = {};
            }
            realpath += '["' + p[i] + '"]';
            data = data[p[i]];
            if(data instanceof Colibri.Storages.Store) {
                return data.Set(first + '.' + p.join('.'));
            }
        }

        eval(realpath + ' = d;');

        if(!nodispatch) {
            this.DispatchPath(path);
            this.Dispatch('StoreUpdated', {path: path, data: d});
        }
        return this;

    }

}