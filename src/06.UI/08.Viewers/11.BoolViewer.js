Colibri.UI.BoolViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-bool-viewer-component');
    }

    set value(value) {
        this._value = value;
        this._showValue();
    }

    get value() {
        return this._value ?? null;
    }

    get field() {
        return this._field;
    }

    set field(field) {
        this._field = field;
        this._showValue();
    }

    _showValue() {

        if(!this._field || this._value === undefined) {
            this._element.html('');
            return;
        }

        const value = this._value[this._field.selector?.value || 'value'] ?? this._value;

        const values = Object.values(this._field.values);
        const found = values.filter(o => o.value == value);

        this._element.html(found.length == 1 ? found[0].title : value);
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.BoolViewer', '#{ui-viewers-bool}');