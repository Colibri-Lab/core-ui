/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.PaneSwitcher = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-paneswitcher');

        this.AddHandler('ChildsProcessed', this.__thisChildsProcessed);

    }

    __thisChildsProcessed(event, args) {
        this.ForEach((name, component) => component.Disconnect());
    }

    HideAll() {
        this.ForEach((name, component) => component.Disconnect());
    }

    /**
     * Show/Hide element
     * @type {Number|String}
     */
    get value() {
        return this._value;
    }
    /**
     * Show/Hide element
     * @type {Number|String}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    /** @private */
    _showValue() {
        this.ForEach((name, component) => component.Disconnect())
        this.Children(this._value).ConnectTo(this);

    }

}