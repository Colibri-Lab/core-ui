Colibri.UI.DateTimeViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-datetime-viewer-component');

        let dateformat = App.DateFormat || 'ru-RU';
        this._format = new Intl.DateTimeFormat(dateformat, {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        
        this._value = null;

    }

    get value() {
        return this._value;
    }

    set value(value) {
        value = this._convertValue(value);
        if(typeof value === 'string') {
            value = value.toDate();
        }
        else if(typeof value === 'number') {
            value = value.toDateFromUnixTime();
        }
        this._value = value;
    
        try {
            super.value = this._value && this._format.format(this._value);
        } catch(e) {
            super.value = '';
        }

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.DateTimeViewer', '#{ui-viewers-datetime}');