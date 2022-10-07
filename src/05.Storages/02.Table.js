Colibri.Storages.Models.Table = class extends Colibri.Events.Dispatcher {
 
    constructor(binding, loader = null) {
        super();

        this._binding = binding;
        this._loader = loader;

        this.load();
    }

    get data() {
        return this._data;
    }

    _registerEvents() {
        this.RegisterEvent('DataChanged', false, 'Когда данные изменились');
    }

    __dataChanged(data, path) {
        this._data = data;
        this.Dispatch('DataChanged');
    }

    load() {

        if(this._loader) {
            App.Store.AddPathLoader(this._binding, this._loader);
        }

        const handler = (data, path) => this.__dataChanged(data, path);
        App.Store.AddPathHandler(this._binding, [this, handler]);
        App.Store.AsyncQuery(this._binding).then((data) => this.__dataChanged(data, this._binding));
    }
    
}