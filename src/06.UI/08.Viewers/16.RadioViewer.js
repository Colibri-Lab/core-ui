/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.RadioViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
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