/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.HtmlDataViewer = class extends Colibri.UI.Viewer {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-htmldata-viewer-component');
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
        let v = !value ? '&mdash;' : value.replaceAll(/\n/, '<br />');
        v = v.stripHtml().words(20);
        super.value = v;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.HtmlDataViewer', '#{ui-viewers-htmldata}');