/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.FileSizeViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-filesize-viewer-component');

        this._size = new Colibri.UI.TextSpan('date', this);
        this._size.shown = true;

        this._value = null;

    }

    /**
     * Value
     * @type {number}
     */
    get value() {
        return this._value;
    }

    /**
     * Value
     * @type {number}
     */
    set value(value) {
        value = this._convertValue(value);
        if(typeof value !== 'number') {
            value = value.toInt();
        }
        this._value = value;
        this._size.value = this._value.toSizeString(['bytes', 'Kb', 'Mb', 'Gb'], 1024, true);

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.FileSizeViewer', '#{ui-viewers-filesize}');