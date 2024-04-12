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
 
    /**
     * Value
     * @type {string}
     */
    set value(value) {
        super.value = value;
        this.styles = {fontFamily: value};
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return super.value;
    }

    /**
     * Field object
     * @type {object}
     */
    get field() {
        return this._field;
    }

    /**
     * Field object
     * @type {object}
     */
    set field(field) {
        this._field = field;
    }

}

Colibri.UI.Viewer.Register('Colibri.UI.FontFamilyViewer', '#{ui-viewers-font-family}');