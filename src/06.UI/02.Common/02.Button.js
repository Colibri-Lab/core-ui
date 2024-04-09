/**
 * Button compomnent
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Button = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('button', {type: 'button'}));
        this.AddClass('app-component-button');
    }

}