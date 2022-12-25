Colibri.UI.RadioViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-radio-viewer-component');

        this._value = null;

    }

    get value() {
        return this.ContainsClass('app-is-read-component');
    }

    set value(value) {
        super.value = value.title;
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.RadioViewer', '#{ui-viewers-radio}');