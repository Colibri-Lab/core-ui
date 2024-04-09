/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.CheckboxAsTextViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-checkboxastext-viewer-component');

        this._value = false;
    }

    get value() {
        return this.value === false ? '' : this._field.placeholder;
    }

    set value(value) {
    
        this._value = value;
        if(value) {
            super.value = this._field.placeholder;
        }
        else {
            super.value = '';
        }

    }


}
Colibri.UI.Viewer.Register('Colibri.UI.CheckboxAsTextViewer', '#{ui-viewers-checkboxastext}');