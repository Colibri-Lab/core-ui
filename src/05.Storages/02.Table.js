Colibri.Storages.Models.Table = class extends Colibri.Events.Dispatcher {
 
    constructor(controller, params) {
        super();

        this._controller = controller;
        this._params = params;
        this._loaded = false;

        this._setControllerData();

        this.bind();
        this.Load();
    }
    
    _setControllerData() {

        // значит это Module:Controller
        const parts = this._controller.split(':');
        const module = eval(parts[0]);
        const controller = parts[1].split('.')[0];

        this._loader = () => module.Call(controller, 'Load', this._params);
        this._saver = () => module.Call(controller, 'Save', this._params);
        this._deleter = () => module.Call(controller, 'Delete', this._params);
    
    }

    _registerEvents() {
        this.RegisterEvent('DataChanged', false, 'Когда данные изменились');
    }

    _convertData(data) {
        this._data = [];
        for(const d of data) {
            this._data.push(new Colibri.Storages.Models.Model(d, this));
        }
    }

    __cometEventReveived(event, args) {
        if(args.message.action == 'data-changed' && args.message.binding == this._binding) {
            this.Load();
        }
    }

    bind() {
        if(App.Comet) {
            App.Comet.Addhandler('EventReceived', (event, args) => this.__cometEventReveived(event, args));
        }
    }

    Load() {
        this._loader().then(data => {
            this._loaded = true;
            this._data = this._convertData(data);
            this.Dispatch('DataChanged', {});
        });
    }

    ForEach(rowHandler) {
        for(const row of this._data) {
            rowHandler(row);
        }
    }

    SaveRow(row) {
        this._saver().then((data) => {
            row.data = data;
            resolve();
        }).catch(error => reject(error));
    }

    DeleteRow(row) {
        this._deleter().then((data) => {
            row.data = data;
            resolve();
        }).catch(error => reject(error));
    }

}