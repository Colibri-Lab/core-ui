/**
 * OL ordered list component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const orderedList = new Colibri.UI.OrderedList('ordered-list', this);
 * const listItem = orderedList.AddItem('item1', 'Item 1');
 * 
 * in html template
 * 
 * <Colibri.UI.OrderedList name="ordered-list">
 *     <Colibri.UI.ListItem name="item1" value="Item 1" />
 * </Colibri.UI.OrderedList>
 * or 
 * <OrderedList name="ordered-list">
 *     <ListItem name="item1" value="Item 1" />
 * </OrderedList>
 * 
 * then in js
 * 
 * const orderedList = this.Children('ordered-list');
 * const listItem = this.Children('ordered-list/item1');
 * ```
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