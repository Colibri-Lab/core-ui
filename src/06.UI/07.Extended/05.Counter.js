/**
 * @class
 * @extends Colibri.UI.TextSpan
 * @memberof Colibri.UI
 */
Colibri.UI.Counter = class extends Colibri.UI.TextSpan {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-indicator-component');
    }

}