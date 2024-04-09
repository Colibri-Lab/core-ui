/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.ArrayViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-array-viewer-component');
    }

    _showValue() {
        let ret = [];
        if(isIterable(this._value)) {
            this._value.forEach(value => {
                ret.push(Object.toQueryString(value, [',<br />', ': ']));
            });
        }
        this._element.html(ret.join(', '));
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
Colibri.UI.Viewer.Register('Colibri.UI.ArrayViewer', '#{ui-viewers-array}');