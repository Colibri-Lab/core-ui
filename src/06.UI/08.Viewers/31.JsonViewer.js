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
        const value = Object.cloneRecursive(this._value);

        if(Array.isArray(value)) {
            if(value.length > 0) {
                for(let index=0; index<value.length;index++) {
                    const v = new Colibri.UI.JsonViewer(this.name + index, this);
                    v.shown = true;
                    v.value = value[index];
                }
            }
        } else if(Object.isObject(value)) {
            const keys = Object.keys(value);
            if(keys.length > 0) {
                const fieldsViewer = new Colibri.UI.FieldsViewer(this.name + 'viewer', this);
                const fields = {};
                for(const k of keys) {
                    fields[k] = {
                        desc: k,
                        component: Object.isObject(value[k]) ? 'Json' : 'Text'
                    };
                }
                fieldsViewer.shown = true;
                fieldsViewer.fields = fields;
                fieldsViewer.value = value;
            }

        }
        


    }


}

Colibri.UI.Viewer.Register('Colibri.UI.JsonViewer', '#{ui-viewers-json}');