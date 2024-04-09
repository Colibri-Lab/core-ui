/**
 * @memberof Colibri.UI
 * @class
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.CheckboxViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-checkbox-viewer-component');

        this._checkbox = new Colibri.UI.Icon(this.name + '_check', this);
        this._checkbox.value = Colibri.UI.AltCheckMarkIcon;
        this._checkbox.shown = true;

    }

    set value(value) {
        if(this._convertValue(value)) {
            this._checkbox.AddClass('-checked');
        } else {
            this._checkbox.RemoveClass('-checked');
        }
    }

    get value() {
        return this._checkbox.ContainsClass('-checked');
    }

    get field() {
        return this._field;
    }

    set field(field) {
        this._field = field;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.CheckboxViewer', '#{ui-viewers-checkbox}');