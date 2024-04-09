/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
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

}