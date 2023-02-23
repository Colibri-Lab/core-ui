Colibri.UI.TextViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-text-viewer-component');
    }

    set value(value) {
        super.value = !value ? '&mdash;' : value;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.TextViewer', '#{ui-viewers-text}');