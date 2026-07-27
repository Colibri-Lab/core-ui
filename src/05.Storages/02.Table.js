/**
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Storages
 */
Colibri.Storages.Models.Table = class extends Colibri.Events.Dispatcher {
 
    /**
     * Constructs an instance of the Colibri.Storages.Models.Table class.
     * @param {string} controller - The controller name for handling data operations.
     * @param {Object} params - Parameters for data operations.
     * @constructor
     */
    constructor(controller, params) {
        super();

        this._controller = controller;
        this._params = params;
        this._loaded = false;

        this._setControllerData();

        this.bind();
        this.Load();
    }
    
    /**
     * Sets up the controller data for loading, saving, and deleting rows based on the provided controller name.
     * @private
     */
    _setControllerData() {

        // значит это Module:Controller
        const parts = this._controller.split(':');
        const module = eval(parts[0]);
        const controller = parts[1].split('.')[0];

        this._loader = () => module.Call(controller, 'Load', this._params);
        this._saver = () => module.Call(controller, 'Save', this._params);
        this._deleter = () => module.Call(controller, 'Delete', this._params);
    
    }

    /** @protected */
    _registerEvents() {
        this.RegisterEvent('DataChanged', false, 'Когда данные изменились');
    }

    /** @private */
    _convertData(data) {
        this._data = [];
        for(const d of data) {
            this._data.push(new Colibri.Storages.Models.Model(d, this));
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __cometEventReveived(event, args) {
        if(args.message.action == 'data-changed' && args.message.binding == this._binding) {
            this.Load();
        }
    }

    /** @private */
    bind() {
        if(App.Comet) {
            App.Comet.Addhandler('EventReceived', (event, args) => this.__cometEventReveived(event, args));
        }
    }

    /**
     * Loads the data for the table by invoking the loader function and dispatching the 'DataChanged' event.
     */
    Load() {
        this._loader().then(data => {
            this._loaded = true;
            this._data = this._convertData(data);
            this.Dispatch('DataChanged', {});
        });
    }

    /**
     * Iterates over each row in the table and applies the provided rowHandler function.
     * @param {function} rowHandler - A callback function to handle each row.
     */
    ForEach(rowHandler) {
        for(const row of this._data) {
            rowHandler(row);
        }
    }

    /**
     * Saves the specified row by invoking the saver function and updating the row's data.
     * @param {Colibri.Storages.Models.Model} row - The row to be saved.
     */
    SaveRow(row) {
        this._saver().then((data) => {
            row.data = data;
            resolve();
        }).catch(error => reject(error));
    }

    /**
     * Deletes the specified row by invoking the deleter function and updating the row's data.
     * @param {Colibri.Storages.Models.Model} row - The row to be deleted.
     */
    DeleteRow(row) {
        this._deleter().then((data) => {
            row.data = data;
            resolve();
        }).catch(error => reject(error));
    }

}