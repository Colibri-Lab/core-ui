

Colibri.Storages.Storage = class extends Colibri.Events.Dispatcher {

    /**
     * конструктор
     * @param {string} name наименование хранилища
     * @param {*} data данные хранилища
     */
    constructor(name, data) {
        super('Storage');

        this._item = new Colibri.Storages.Item(name, data);

        this.RegisterEvents();
        this.RegisterEventHandlers();
    }

    /**
     * регистрация событий
     */
    RegisterEvents() {
        this.RegisterEvent('StorageUpdated', false, 'Когда данные обновлены');
    }

    RegisterEventHandlers() {
        this._item.AddHandler('StorageItemUpdated', (event, args) => {
            this.Dispatch('StorageUpdated', {item: args.item, path: args.path});
        });
    }

    Query(path) {
        return this._item.Query(path);
    }

    Set(path, data) {
        const item = this.Query(path);
        if(item) {
            item.data = data;
            return true;
        }
        return false;
    }

}