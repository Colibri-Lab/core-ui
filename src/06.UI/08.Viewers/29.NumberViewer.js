Colibri.UI.NumberViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-number-viewer-component');
    }

    set value(value) {
        let v = !value || !isFinite(value) ? '0' : value;

        
        if(this.field?.params?.format === 'money') {
            const formatter = new Intl.NumberFormat(App.NumberFormat, {style: 'currency', currency: App.Currency.code, maximumFractionDigits: this.field?.params?.decimal ?? 2});
            v = formatter.format(parseFloat(v));
            // v = parseFloat(v).toMoney(this.field?.params?.decimal ?? 2);
        }
        else if(this.field?.params?.format === 'percent') {
            const formatter = new Intl.NumberFormat(App.NumberFormat, {style: 'percent', maximumFractionDigits: this.field?.params?.decimal ?? 2, minimumFractionDigits: this.field?.params?.decimal ?? 2});
            if(v > 1) {
                v = v / 100;
            }
            v = formatter.format(parseFloat(v));
            // v = parseFloat(v).toMoney(this.field?.params?.decimal ?? 2);
        }
        else if(this.field?.params?.format === 'bytes') {
            v = parseFloat(v).toSizeString(['bytes', 'Kb', 'Mb', 'Gb'], 1024);            
        }
        else {
            if(this.field?.params?.decimal) {
                v = parseFloat(v).toMoney(this.field?.params?.decimal ?? 2);
            }
            if(this.field?.params?.unit) {
                v = v + ' ' + (Array.isArray(this.field?.params?.unit) ? parseFloat(v).formatSequence(this.field?.params?.unit, false) : this.field?.params?.unit);
            }
        }


        super.value = v;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.NumberViewer', '#{ui-viewers-number}');