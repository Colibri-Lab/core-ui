/**
 * @memberof Colibri.UI
 * @class
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.ToggleboxViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-togglebox-viewer-component');

        this._checkbox = new Colibri.UI.ToggleBox(this.name + '_check', this);
        this._checkbox.readonly = true;
        this._checkbox.value = Colibri.UI.AltCheckMarkIcon;
        this._checkbox.shown = true;

    }

    /**
     * Value
     * @type {boolean}
     */
    set value(value) {
        this._checkbox.checked = this._convertProperty('Boolean', value);
    }

    /**
     * Value
     * @type {boolean}
     */
    get value() {
        return this._checkbox.checked;
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
Colibri.UI.Viewer.Register('Colibri.UI.ToggleboxViewer', '#{ui-viewers-togglebox}');