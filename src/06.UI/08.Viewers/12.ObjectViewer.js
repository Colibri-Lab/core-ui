Colibri.UI.ObjectViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-object-viewer-component');
    }

    _showValue() {
        let ret = [];
        if(Object.countKeys(this._field.fields) > 0) {
            Object.forEach(this._value, (name, value) => {
                if(value instanceof Object && value.value && value.title) {
                    value = value.title;
                }
    
                if(this._field.fields[name]) {
                    const desc = Lang ? Lang.Translate(this._field.fields[name].desc) : this._field.fields[name].desc;
                    ret.push(desc + ': ' + value);
                }
            });
            this._element.html(ret.join(' '));
        } else {
            this._element.html(JSON.stringify(this._value));
        }
    }

    get value() {
        return this._value;
    }

    set value(value) {
        value = this._convertValue(value);
        this._value = value;
        this._showValue();
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.ObjectViewer', '#{ui-viewers-object}');