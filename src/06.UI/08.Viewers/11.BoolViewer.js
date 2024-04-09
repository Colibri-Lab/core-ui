/**
 * Bool viewer
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.BoolViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */    
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-bool-viewer-component');
    }

    /**
     * Value
     * @type {boolean}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }

    /**
     * Value object
     * @type {boolean}
     */
    get value() {
        return this._value ?? null;
    }

    /**
     * Field object
     * @type {object}
     */
    get field() {
        return this._field;
    }

    /**
     * Field object
     * @type {object}
     */
    set field(field) {
        this._field = field;
        this._showValue();
    }

    /**
     * @private
     */
    _showValue() {

        if(!this._field || this._value === undefined) {
            this._element.html('');
            return;
        }

        
        let value = this._value[this._field.selector?.value || 'value'] ?? this._value;
        value = this._convertValue(value);

        const values = Object.values(this._field.values);
        const found = values.filter(o => o.value == value);

        if(this._field?.params?.colors) {
            this.RemoveClass(this._field.params.colors.map(v => v!=''));
            if(value) {
                this.AddClass(this._field.params.colors[0]);
            } else {
                this.AddClass(this._field.params.colors[1]);
            }
        }

        this._element.html(found.length == 1 ? found[0].title : value);
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.BoolViewer', '#{ui-viewers-bool}');