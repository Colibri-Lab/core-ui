/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.TextAreaViewer = class extends Colibri.UI.Viewer {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-textarea-viewer-component');
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return super.value;
    }
    
    /**
     * Value
     * @type {string}
     */
    set value(value) {
        super.value = !value ? '&mdash;' : value.replaceAll(/\n/, '<br />');
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.TextAreaViewer', '#{ui-viewers-textarea}');