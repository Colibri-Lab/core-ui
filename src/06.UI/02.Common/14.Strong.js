/**
 * Strong component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const strong = new Colibri.UI.Strong('strong', this);
 * strong.value = 'Strong text';    
 * 
 * in html template
 * 
 * <Colibri.UI.Strong name="strong" value="Strong text" />
 * or 
 * <Strong name="strong" value="Strong text" />
 * 
 * then in js
 * 
 * const strong = this.Children('strong');
 * ```
 */
Colibri.UI.Strong = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('strong'));
        this.AddClass('app-component-strong');
    }

}