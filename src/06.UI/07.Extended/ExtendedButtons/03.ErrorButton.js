/**
 * Error action related button
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.ErrorButton = class extends Colibri.UI.ExtendedButton {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-error-button-component');
    }
}