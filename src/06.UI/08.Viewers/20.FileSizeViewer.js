Colibri.UI.FileSizeViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-filesize-viewer-component');

        this._size = new Colibri.UI.TextSpan('date', this);
        this._size.shown = true;

        this._value = null;

    }

    get value() {
        return this._value;
    }

    set value(value) {
        value = this._convertValue(value);
        if(typeof value !== 'number') {
            value = value.toInt();
        }
        this._value = value;
        this._size.value = this._value.toSizeString(['bytes', 'Kb', 'Mb', 'Gb'], 1024, true);

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.FileSizeViewer', '#{ui-viewers-filesize}');