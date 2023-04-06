Colibri.UI.ImageViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-image-viewer-component');

        this._colorBox = new Colibri.UI.TextSpan(this.name + '_colorbox', this);
        this._colorBox.shown = true;

        this._view = new Colibri.UI.TextSpan(this.name + '_view', this);
        this._view.shown = true;

    }
 
    set value(value) {
        value = this._convertValue(value);
        this._colorBox.styles = {backgroundImage: value.indexOf('url') !== -1 ? value : 'url(' + value + ')'};
        this._view.value = value;
    }

    get value() {
        return this._view.value;
    }

    get field() {
        return this._field;
    }

    set field(field) {
        this._field = field;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.ImageViewer', '#{ui-viewers-image}');