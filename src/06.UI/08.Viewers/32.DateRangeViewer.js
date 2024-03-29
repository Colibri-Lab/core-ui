Colibri.UI.DateRangeViewer = class extends Colibri.UI.Viewer {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-daterangeviewer');

        let dateformat = App.DateFormat || 'ru-RU';
        this._format = new Intl.DateTimeFormat(dateformat, {day: '2-digit', month: 'short', year: 'numeric'});
        this._value = null;



    }
   

    get value() {
        return this._value;
    }

    set value(value) {
        if(!Array.isArray(value)) {
            value = [value, null];
        }

        this._value = value;
    
        try {
            super.value = this._format.format(this._value[0].toDate()) + (this._value[1] !== null ? ' &mdash; ' + this._format.format(this._value[1].toDate()) : '');
        } catch(e) {
            console.log(e);
            super.value = '';
        }

    }
}