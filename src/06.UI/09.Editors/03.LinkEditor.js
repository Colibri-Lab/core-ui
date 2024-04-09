/**
 * @class
 * @extends Colibri.UI.Editor
 * @memberof Colibri.UI
 */
Colibri.UI.LinkEditor = class extends Colibri.UI.Editor {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */     
    constructor(name, container) {
        super(name, container, Element.create('input'));
        this.AddClass('app-link-editor-component');

    }
    
    
    Validate() {
        
    }

}