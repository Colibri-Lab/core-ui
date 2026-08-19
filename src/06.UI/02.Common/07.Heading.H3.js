/**
 * H3 component
 * @class
 * @extends Colibri.UI.Heading
 * @memberof Colibri.UI
 * @example
 * ```
 * const h3 = new Colibri.UI.H3('h3', this);
 * h3.value = 'Heading 3';
 * 
 * in html template
 * 
 * <Colibri.UI.H3 name="h3" value="Heading 3" />
 * or 
 * <H3 name="h3" value="Heading 3" />
 * 
 * then in js
 * 
 * const h3 = this.Children('h3');
 * ```
 */
Colibri.UI.H3 = class extends Colibri.UI.Heading {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, 3);
        this.AddClass('app-component-heading-h3');
    }
}
