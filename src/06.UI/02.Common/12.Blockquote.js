/**
 * Blockquote component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * 
 * @example
 * ```
 * const blockquote = new Colibri.UI.Blockquote('blockquote', this);
 * 
 * in html template
 * 
 * <Colibri.UI.Blockquote name="blockquote" />
 * or 
 * <Blockquote name="blockquote" />
 * 
 * then in js
 * 
 * const blockquote = this.Children('blockquote');
 * ```
 */
Colibri.UI.Blockquote = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('blockquote'));
        this.AddClass('app-component-blockquote');


    }

}