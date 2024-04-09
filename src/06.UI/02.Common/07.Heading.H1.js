/**
 * @class
 * @extends Colibri.UI.Heading
 * @memberof Colibri.UI
 */
Colibri.UI.H1 = class extends Colibri.UI.Heading {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, 1);
        this.AddClass('app-component-heading-h1');
    }
}
