Colibri.UI.FontFamilyViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-shadow-viewer-component');

    }
 
    set value(value) {
        super.value = value;
        this.styles = {fontFamily: value};
    }

    get value() {
        return super.value;
    }

    get field() {
        return this._field;
    }

    set field(field) {
        this._field = field;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.FontFamilyViewer', '#{app-viewers-font-family;Шрифт}');