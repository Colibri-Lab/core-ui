Colibri.UI.PeriodViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-period-viewer-component');

        this._value = null;

    }

    get value() {
        return this.ContainsClass('app-is-read-component');
    }

    set value(value) {
        let _value = value;
        if(typeof _value === 'string') {
            _value = value.toDate();
            if(_value.toString() === 'Invalid Date') {
                super.value = value;
                return;
            }
        }

        this._value = _value;

        let date1 = _value[0];
        let date2 = _value[1];

        let days = 0;
        if (date1 && date2 && date1 !== 'Invalid Date' && date2 !== 'Invalid Date') {
            days = parseInt((date2.toDate().getTime() - date1.toDate().getTime()) / 1000 / 86400) + 1;
            super.value = date1.toDate().toShortRUString() + ' &ndash; ' + date2.toDate().toShortRUString() + ', ' + days.formatSequence(['день', 'дня', 'дней'], true);
        } else {
            super.value = date1.toDate().toShortRUString() + ' &ndash; -, ' + days.formatSequence(['день', 'дня', 'дней'], true);
        }
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.PeriodViewer', '#{app-viewers-period;Период}');