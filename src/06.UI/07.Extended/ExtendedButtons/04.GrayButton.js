/**
 * Grayed button
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.GrayButton = class extends Colibri.UI.ExtendedButton {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-gray-button-component');
    }
}