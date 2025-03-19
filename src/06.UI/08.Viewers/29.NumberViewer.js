/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.NumberViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-number-viewer-component');
    }

    /**
     * Value
     * @type {number}
     */
    get value() {
        return this._value;
    }

    /**
     * Value
     * @type {number}
     */
    set value(value) {
        this._value = value;
        value = this._convertValue(value);
        const emptyMessage = this.field?.params?.empty ?? this._emptyMessage ?? '';
        if((!value || !isFinite(value)) && !!emptyMessage) {
            super.value = emptyMessage;
            return;
        }

        let v = !value || !isFinite(value) ? '0' : value; 
        if(this.field?.params?.format === 'money') {
            const formatter = new Intl.NumberFormat(App.NumberFormat, {style: 'currency', currency: this._field?.params?.currency ?? App.Currency?.code ?? '', maximumFractionDigits: this.field?.params?.decimal ?? 2});
            v = formatter.format(parseFloat(v));
        }
        else if(this.field?.params?.format === 'percent') {
            const isShare = this.field?.params?.isShare ?? false;
            const formatter = new Intl.NumberFormat(App.NumberFormat, {style: 'percent', maximumFractionDigits: this.field?.params?.decimal ?? 2, minimumFractionDigits: this.field?.params?.decimal ?? 2});
            if(!isShare) {
                v = v / 100;
            }
            v = formatter.format(parseFloat(v));
            // v = parseFloat(v).toMoney(this.field?.params?.decimal ?? 2);
        }
        else if(this.field?.params?.format === 'bytes') {
            v = parseFloat(v).toSizeString(['bytes', 'Kb', 'Mb', 'Gb'], 1024);            
        }
        else {
            
            if(this.field?.params?.decimal && !this.field?.params?.forceformat) {
                v = parseFloat(v).toMoney(this.field?.params?.decimal ?? 2);
            }

            if(this.field?.params?.unit) {
                v = v + ' ' + (Array.isArray(this.field?.params?.unit) ? parseFloat(v).formatSequence(this.field?.params?.unit, false) : this.field?.params?.unit);
            } else if(this.field?.params?.forceformat) {
                const options = {};
                if(this.field?.params?.decimal) {
                    options.maximumFractionDigits = this.field?.params?.decimal;
                }
                v = new Intl.NumberFormat(App.NumberFormat, options).format(v);
            }
        }


        // check if the result number is negative zero
        if(parseInt(v) === 0 && v.substring(0, 1) === '-') {
            // remove leading negative sign if the number is zero
            v = v.substring(1);
        }

        super.value = v;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.NumberViewer', '#{ui-viewers-number}');