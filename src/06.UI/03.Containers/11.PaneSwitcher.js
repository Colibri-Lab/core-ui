/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const paneSwitcher = new Colibri.UI.PaneSwitcher('paneSwitcher', this);
 * 
 * const pane1 = new Colibri.UI.Pane('pane1', paneSwitcher);
 * pane1.value = 'Pane 1';
 * 
 * const pane2 = new Colibri.UI.Pane('pane2', paneSwitcher);
 * pane2.value = 'Pane 2';
 * 
 * paneSwitcher.value = 'pane1'; // show pane1
 * 
 * in html template
 * 
 * <Colibri.UI.PaneSwitcher name="paneSwitcher" value="pane1">
 *      <Colibri.UI.Pane name="pane1" value="Pane 1" />
 *      <Colibri.UI.Pane name="pane2" value="Pane 2" />
 * </Colibri.UI.PaneSwitcher>
 * 
 * then in js
 * 
 * const paneSwitcher = this.Children('paneSwitcher');
 * ```
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

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisChildsProcessed(event, args) {
        this.ForEach((name, component) => component.Disconnect());
    }

    /**
     * Hide all panes
     * @public
     */
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
    /** 
     * @ignore
     * @private
     */
    _showValue() {
        this.ForEach((name, component) => component.Disconnect())
        this.Children(this._value)?.ConnectTo(this);

    }

}