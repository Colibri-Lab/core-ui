Colibri.UI.LinkViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-link-viewer-component');
    }

    set downloadlink(value) {
        this._downloadlink = value;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.LinkViewer', '#{ui-viewers-link}');