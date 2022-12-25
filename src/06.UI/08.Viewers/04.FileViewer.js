Colibri.UI.FileViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-file-viewer-component');

        this._value = null;

        this._icon = new Colibri.UI.Icon(this.name + '-icon', this);
        this._icon.value = Colibri.UI.FileDownloadIcon;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        
        /**
         * [{
         * file: path,
         * name: name
         * }...]
         */

        this._value = value;
        if(this._value && this._value.length > 0) {
            this._icon.shown = true;
        }
        else {
            this._icon.shown = false;
        }

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.FileViewer', '#{ui-viewers-file}');