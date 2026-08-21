/**
 * Shader component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * @example
 * ```
 * const shader = new Colibri.UI.Shader('shader', this);
 * shader.shown = true;
 * 
 * in html template
 * 
 * <Shader name="shader" shown="shown" />
 * 
 * then in js
 * 
 * const shader = this.Children('shader');
 * ```
 */
Colibri.UI.Shader = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-shader-component');
        
    }
}