/**
 * Horizontal line component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const hr = new Colibri.UI.Hr('hr', this);
 * 
 * in html template
 * 
 * <Colibri.UI.Hr name="hr" />
 * or 
 * <Hr name="hr" />
 * 
 * then in js
 * 
 * const hr = this.Children('hr');
 * ```
 */
Colibri.UI.Hr = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('hr'));
        this.AddClass('app-component-hr');
    }

}