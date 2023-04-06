Colibri.UI.MonthYearViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-monthyear-viewer-component');
    }

    set value(value) {
        value = this._convertValue(value);
        if(typeof value == 'string') {
            value = (value + '-01').toDate();
        }
        const formatter = new Intl.DateTimeFormat('ru-RU', {month: 'short', year: 'numeric'});
        super.value = formatter.format(value)
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.MonthYearViewer', '#{ui-viewers-monthyear}');