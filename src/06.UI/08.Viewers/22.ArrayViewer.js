Colibri.UI.ArrayViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-array-viewer-component');
    }

    _showValue() {
        let ret = [];
        this._value.forEach(v => {
            Object.forEach(v, (name, value) => {
                ret.push(value);
            });
        });
        this._element.html(ret.join(', '));
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._showValue();
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.ArrayViewer', '#{app-viewers-array;Массив}');