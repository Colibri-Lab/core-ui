Colibri.UI.TextAreaViewer = class extends Colibri.UI.Viewer {
    
    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-textarea-viewer-component');



    }

    set value(value) {
        super.value = !value ? '&mdash;' : value.replaceAll(/\n/, '<br />');
    }


}