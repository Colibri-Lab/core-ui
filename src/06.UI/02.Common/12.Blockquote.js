/**
 * Blockquote component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
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