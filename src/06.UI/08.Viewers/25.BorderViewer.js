Colibri.UI.BorderViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-border-viewer-component');

        this._colorBox = new Colibri.UI.TextSpan(this.name + '_colorbox', this);
        this._colorBox.shown = true;

        this._view = new Colibri.UI.TextSpan(this.name + '_view', this);
        this._view.shown = true;

    }
 
    set value(value) {
        this._colorBox.styles = {border: value};
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
Colibri.UI.Viewer.Register('Colibri.UI.BorderViewer', '#{app-viewers-border;Рамка}');