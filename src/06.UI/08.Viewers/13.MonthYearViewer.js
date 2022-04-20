Colibri.UI.MonthYearViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-monthyear-viewer-component');
    }

    set value(value) {
        if(typeof value == 'string') {
            value = (value + '-01').toDate();
        }
        const formatter = new Intl.DateTimeFormat('ru-RU', {month: 'short', year: 'numeric'});
        super.value = formatter.format(value)
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.MonthYearViewer', 'Месяц/Год');