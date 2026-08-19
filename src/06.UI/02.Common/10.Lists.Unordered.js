/**
 * UL unordered list component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const unorderedList = new Colibri.UI.UnorderedList('unordered-list', this);
 * const listItem = unorderedList.AddItem('item1', 'Item 1');
 * 
 * in html template
 * 
 * <Colibri.UI.UnorderedList name="unordered-list">
 *     <Colibri.UI.ListItem name="item1" value="Item 1" />
 * </Colibri.UI.UnorderedList>
 * or 
 * <UnorderedList name="unordered-list">
 *     <ListItem name="item1" value="Item 1" />
 * </UnorderedList>
 * 
 * then in js
 * 
 * const unorderedList = this.Children('unordered-list');
 * const listItem = this.Children('unordered-list/item1');
 * ```
 */
Colibri.UI.UnorderedList = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {*} element element to generate in 
     */
    constructor(name, container, element) {
        super(name, container, element || Element.create('ul'));
        this.AddClass('app-component-unorderedlist');
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