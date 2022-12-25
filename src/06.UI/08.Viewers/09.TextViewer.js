Colibri.UI.TextViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-text-viewer-component');
    }

    set value(value) {
        super.value = !value ? '&mdash;' : value;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.TextViewer', '#{ui-viewers-text}');