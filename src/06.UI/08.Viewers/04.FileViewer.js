/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.FileViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-file-viewer-component');

        this._value = null;

        this._icon = new Colibri.UI.Icon(this.name + '-icon', this);
        this._icon.value = Colibri.UI.FileDownloadIcon;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        
        /**
         * [{
         * file: path,
         * name: name
         * }...]
         */

        this._value = this._convertValue(value);
        if(this._value && this._value.length > 0) {
            this._icon.shown = true;
        }
        else {
            this._icon.shown = false;
        }

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.FileViewer', '#{ui-viewers-file}');