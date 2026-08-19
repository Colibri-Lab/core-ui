/**
 * Menu list component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const menuList = new Colibri.UI.MenuList('menu-list', this);
 * const listItem = menuList.AddItem('item1', 'Item 1');
 * 
 * in html template
 * 
 * <Colibri.UI.MenuList name="menu-list">
 *     <Colibri.UI.ListItem name="item1" value="Item 1" />
 * </Colibri.UI.MenuList>
 * or 
 * <MenuList name="menu-list">
 *     <ListItem name="item1" value="Item 1" />
 * </MenuList>
 * 
 * then in js
 * 
 * const menuList = this.Children('menu-list');
 * const listItem = this.Children('menu-list/item1');
 * ```
 */
Colibri.UI.MenuList = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container, element) {
        super(name, container, element || Element.create('menu'));
        this.AddClass('app-component-menulist');
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