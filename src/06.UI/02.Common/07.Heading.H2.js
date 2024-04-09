/**
 * @class
 * @extends Colibri.UI.Heading
 * @memberof Colibri.UI
 */
Colibri.UI.H2 = class extends Colibri.UI.Heading {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, 2);
        this.AddClass('app-component-heading-h2');
    }
}

