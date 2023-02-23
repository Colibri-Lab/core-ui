Colibri.UI.TextAreaViewer = class extends Colibri.UI.Viewer {
    
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-textarea-viewer-component');



    }

    set value(value) {
        super.value = !value ? '&mdash;' : value.replaceAll(/\n/, '<br />');
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.TextAreaViewer', '#{ui-viewers-textarea}');