/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.YearViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-year-viewer-component');
    }

    set value(value) {
        value = this._convertValue(value);
        if(typeof value == 'number' || typeof value == 'string') {
            value = (value + '-01-01').toDate();
        }
        const formatter = new Intl.DateTimeFormat('ru-RU', {year: 'numeric'});
        super.value = formatter.format(value) + ' г.'
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.YearViewer', '#{ui-viewers-year}');