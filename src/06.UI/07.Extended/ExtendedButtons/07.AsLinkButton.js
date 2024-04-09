/**
 * Button viewed as link
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.AsLinkButton = class extends Colibri.UI.ExtendedButton {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container component or element
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-aslink-button-component');
    }
    
}