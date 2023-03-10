Colibri.UI.JsonViewer = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-jsonviewer');



    }

    /**
     * Value as Object or array
     * @type {Object|Array}
     */
    get value() {
        return this._value;
    }
    /**
     * Value as Object or array
     * @type {Object|Array}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {

        if(Array.isArray(this._value)) {
            if(this._value.length > 0) {
                for(let index=0; index<this._value.length;index++) {
                    const value = this._value[index];
                    const v = new Colibri.UI.JsonViewer(this.name + index, this);
                    v.shown = true;
                    v.value = value;
                }
            }
        } else if(this._value instanceof Object) {
            const keys = Object.keys(this._value);
            if(keys.length > 0) {
                const fieldsViewer = new Colibri.UI.FieldsViewer(this.name + 'viewer', this);
                const fields = {};
                for(const k of keys) {
                    fields[k] = {
                        desc: k,
                        component: this._value[k] instanceof Object ? 'Json' : 'Text'
                    };
                }
                fieldsViewer.shown = true;
                fieldsViewer.fields = fields;
                fieldsViewer.value = this._value;
            }

        }
        


    }


}

Colibri.UI.Viewer.Register('Colibri.UI.JsonViewer', '#{ui-viewers-json}');