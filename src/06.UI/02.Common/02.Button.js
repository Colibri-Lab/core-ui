/**
 * Button compomnent
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * let button = new Colibri.UI.Button('button', this);
 * button.value = 'Click me';
 * button.AddHandler('Clicked', (event, args) => {
 *      console.log('Button clicked');
 * });
 * 
 * in html template
 * 
 * <Colibri.UI.Button name="button" value="Click me" />
 * 
 * then in js
 * 
 * let button = this.Children('button');
 * 
 * ```
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