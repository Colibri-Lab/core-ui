Colibri.UI.NumberViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-number-viewer-component');
    }

    set value(value) {
        let v = !value || !isFinite(value) ? '0' : value;
        
        if(this.field?.params?.format === 'money') {
            v = parseFloat(v).toMoney(this.field?.params?.decimal ?? 2);
        }
        else if(this.field?.params?.format === 'percent') {
            if(v < 1) {
                v = v * 100;
            }
            v = parseFloat(v).toMoney(this.field?.params?.decimal ?? 2);
        }

        if(this.field?.params?.unit) {
            v = v + ' ' + this.field?.params?.unit;
        }

        super.value = v;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.NumberViewer', '#{app-viewers-number;Цифра}');