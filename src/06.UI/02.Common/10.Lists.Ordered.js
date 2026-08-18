/**
 * OL ordered list component
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

    /**
     * Adds a new item to the list
     * @param {*} value value of the item
     * @param {string} name name of the item
     * @returns {Colibri.UI.ListItem} list item component
     * @public
     */
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