/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.OrderedList = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {*} element element to generate in 
     */
    constructor(name, container, element) {
        super(name, container, element || Element.create('ol'));
        this.AddClass('app-component-orderedlist');
    }

    AddItem(value = null, name = null) {
        const n = new Colibri.UI.ListItem(name, this);
        n.shown = true;
        if(value instanceof Function) {
            value(n);
        } else {
            n.value = value;
        }
        return n;
    }
}