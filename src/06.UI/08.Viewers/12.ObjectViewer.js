Colibri.UI.ObjectViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-object-viewer-component');
    }

    _showValue() {
        let ret = [];
        Object.forEach(this._value, (name, value) => {
            if(value instanceof Object && value.value && value.title) {
                value = value.title;
            }
            ret.push(value);
        });
        this._element.html(ret.join(' '));
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._showValue();
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.ObjectViewer', '#{app-viewers-object;Обьект}');