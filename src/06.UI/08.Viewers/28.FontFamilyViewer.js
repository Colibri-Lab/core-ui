/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.FontFamilyViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-shadow-viewer-component');

    }
 
    set value(value) {
        super.value = value;
        this.styles = {fontFamily: value};
    }

    get value() {
        return super.value;
    }

    get field() {
        return this._field;
    }

    set field(field) {
        this._field = field;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.FontFamilyViewer', '#{ui-viewers-font-family}');