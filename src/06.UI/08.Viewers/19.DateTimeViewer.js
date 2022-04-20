Colibri.UI.DateTimeViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-datetime-viewer-component');

        this._date = new Colibri.UI.TextSpan('date', this);
        this._time = new Colibri.UI.TextSpan('time', this);
        this._date.shown = this._time.shown = true;

        this._value = null;

    }

    get value() {
        return this._value;
    }

    set value(value) {
        if(typeof value === 'string') {
            value = value.toDate();
        }
        else if(typeof value === 'number') {
            value = value.toDateFromUnixTime();
        }
        this._value = value;
        
        if(this._value) {
            this._date.value = this._value.toShortRUString();
            this._time.value = this._value.toTimeString();
        }

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.DateTimeViewer', 'Дата и время');