Colibri.UI.HtmlDataViewer = class extends Colibri.UI.Viewer {
    
    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-htmldata-viewer-component');
    }

    set value(value) {
        let v = !value ? '&mdash;' : value.replaceAll(/\n/, '<br />');
        v = v.stripHtml().words(20);
        super.value = v;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.HtmlDataViewer', '#{app-viewers-htmldata;HTML код}');