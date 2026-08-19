/**
 * UL, OL list item component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const list = new Colibri.UI.UnorderedList('list', this);
 * const listItem = list.AddItem('item1', 'Item 1');
 * 
 * or
 * 
 * const listItem = new Colibri.UI.ListItem('list-item', list);
 * ```
 */
Colibri.UI.ListItem = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('li'));
        this.AddClass('app-component-listitem');
    }

}