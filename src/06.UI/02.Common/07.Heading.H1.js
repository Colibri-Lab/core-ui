/**
 * H1 component
 * @class
 * @extends Colibri.UI.Heading
 * @memberof Colibri.UI
 * @example
 * ```
 * const h1 = new Colibri.UI.H1('h1', this);
 * h1.value = 'Heading 1';
 * 
 * in html template
 * 
 * <Colibri.UI.H1 name="h1" value="Heading 1" />
 * or 
 * <H1 name="h1" value="Heading 1" />
 * 
 * then in js
 * 
 * const h1 = this.Children('h1');
 * ```
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
