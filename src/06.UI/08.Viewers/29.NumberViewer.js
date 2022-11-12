Colibri.UI.NumberViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-number-viewer-component');
    }

    set value(value) {
        let v = !value ? '&mdash;' : value;
        
        if(this.field?.params?.format === 'money') {
            v = v !== '&mdash;' ? parseFloat(v).toMoney(this.field?.params?.decimal ?? 2) : v;
        }

        if(this.field?.params?.unit) {
            v = v !== '&mdash;' ? v + ' ' + this.field?.params?.unit : v;
        }

        super.value = v;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.NumberViewer', '#{app-viewers-number;Цифра}');