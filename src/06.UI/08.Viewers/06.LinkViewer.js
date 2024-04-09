/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.LinkViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('a'), root);
        this.AddClass('app-link-viewer-component');
    }

    get value() {
        return this._value;
    }
    set value(value) {
        value = this._convertValue(value);
        this._value = value;
        this._element.attr('target', this._field?.params?.target ?? '_self');
        this._element.attr('href', value);
        this._element.html(value);
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.LinkViewer', '#{ui-viewers-link}');