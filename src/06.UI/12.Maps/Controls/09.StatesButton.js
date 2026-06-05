/**
 * Button component
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Maps.Controls
 */
Colibri.UI.Maps.Controls.StatesButton = class extends Colibri.UI.FlexBox {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.Controls.StatesButton']);
        this.AddClass('colibri-ui-maps-controls-statesbutton');

        this._values = [];

        this._icon = this.Children('icon');
        this._label = this.Children('label');

        this.AddHandler('Clicked', this.__thisClicked);
        this.AddHandler('ContextMenuItemClicked', this.__thisContextMenuItemClicked);
        
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When current layer is changed');
    }

    __thisClicked(event, args) {
        const contextmenu = [];
        for(const value of this._values) {
            contextmenu.push({name: 'item' + value.value, title: value.title, icon: eval(value.icon), value: value});
        }
        this.contextmenu = contextmenu;
        this.ShowContextMenu([Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT]);

    }

    __thisContextMenuItemClicked(event, args) {
        if(args.menuData?.name ?? null) {
            this.value = args.menuData?.value ?? null;
            this.Dispatch('Changed', {value: args.menuData?.value ?? null});
        }
    }

    /**
     * Values
     * @type {Array<Object<value,title,icon>>}
     */
    get values() {
        return this._values;
    }
    /**
     * Values
     * @type {Array<Object<value,title,icon>>}
     */
    set values(value) {
        value = this._convertProperty('Array', value);
        this._values = value;
    }

    /**
     * Value Object
     * @type {Object}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Object
     * @type {Object}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        this._icon.iconSVG = this._value?.icon ?? '';
        this._label.value = this._value?.title ?? '';
    }

}