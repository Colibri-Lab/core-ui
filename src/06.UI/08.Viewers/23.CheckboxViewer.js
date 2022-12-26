Colibri.UI.CheckboxViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-bool-viewer-component');

        this._checkbox = new Colibri.UI.Checkbox(this.name + '_check', this);
        this._checkbox.shown = true;
        this._checkbox.readonly = true;
    }

    set value(value) {
        this._checkbox.readonly = false;
        this._checkbox.checked = value;
        this._checkbox.readonly = true;
    }

    get value() {
        return this._checkbox.checked ?? null;
    }

    get field() {
        return this._field;
    }

    set field(field) {
        this._field = field;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.CheckboxViewer', '#{ui-viewers-checkbox}');