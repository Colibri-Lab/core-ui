Colibri.UI.DateViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-date-viewer-component');

        let dateformat = App.DateFormat || 'ru-RU';
        this._format = new Intl.DateTimeFormat(dateformat, {day: '2-digit', month: 'short', year: 'numeric'});
        this._value = null;

    }

    get value() {
        return this.ContainsClass('app-is-read-component');
    }

    set value(value) {
        if(typeof value === 'string') {
            value = value.toDate();
        }
        this._value = value;
    
        super.value = this._value && this._format.format(this.value);

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.DateViewer', '#{app-viewers-date;Дата}');