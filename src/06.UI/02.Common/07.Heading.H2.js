/**
 * H2 component
 * @class
 * @extends Colibri.UI.Heading
 * @memberof Colibri.UI
 * @example
 * ```
 * const h2 = new Colibri.UI.H2('h2', this);
 * h2.value = 'Heading 2';
 * 
 * in html template
 * 
 * <Colibri.UI.H2 name="h2" value="Heading 2" />
 * or 
 * <H2 name="h2" value="Heading 2" />
 * 
 * then in js
 * 
 * const h2 = this.Children('h2');
 * ```
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

