Colibri.UI.DocumentViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<div />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-document-viewer-component');
    }

    set value(value) {
        let v = !value ? '&mdash;' : value;
        
        if(this.field?.params?.format === 'money') {
            v = v !== '&mdash;' ? parseFloat(v).toMoney(this.field?.params?.decimal ?? 2) : v;
        }

        super.value = v;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.DocumentViewer', '#{app-viewers-document;Документ}');