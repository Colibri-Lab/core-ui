/**
 * Json type log
 * @class
 * @extends Colibri.UI.List
 * @memberof Colibri.UI.Logs
 */
Colibri.UI.Logs.JsonLog = class extends Colibri.UI.List {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Logs.JsonLog']);
        this.AddClass('colibri-ui-logs-jsonlog');

        this._listGroup = this.Children('list-group');
        
        this.__renderItemContent = (item, itemObject) => {
            return JSON.stringify(item, null, 2);
        };

    }

    Log(args) {
        this._listGroup.AddItem({ ...args, id: Date.Mc() });
        this.ShowLastMessage();
    }

}