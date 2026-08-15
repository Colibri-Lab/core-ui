/**
 * Shows log messages in JSON format
 * @example
 * ```
 * const log = new Colibri.UI.Logs.JsonLog('log', parent);
 * log.value = { message: 'Hello, world!', level: 'info' };
 * 
 * /// using html template
 * <Colibri.UI.Logs.JsonLog name="log" value="{ message: 'Hello, world!', level: 'info' }" />
 * /// or
 * <Logs.JsonLog name="log" value="{ message: 'Hello, world!', level: 'info' }" />
 * /// then in template js file 
 * /// in constructor
 * this._log = this.Children('log');
 * /// then in some method
 * this._log.value = { message: 'Hello, world!', level: 'info' };
 * ```
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

    /**
     * Add log message
     * @param {object} args log message arguments
     * @public
     */
    Log(args) {
        this._listGroup.AddItem({ ...args, id: Date.Mc() });
        this.ShowLastMessage();
    }

}