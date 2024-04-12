/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.ObjectViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-object-viewer-component');
    }

    /** @private */ 
    _showValue() {
        let ret = [];
        if(Object.countKeys(this._field.fields) > 0) {
            Object.forEach(this._value, (name, value) => {
                if(Object.isObject(value) && value.value && value.title) {
                    value = value.title;
                }
    
                if(this._field.fields[name]) {
                    const desc = Lang ? Lang.Translate(this._field.fields[name].desc) : this._field.fields[name].desc;
                    ret.push(desc + ': ' + value);
                }
            });
            this._element.html(ret.join(' '));
        } else {
            this._element.html(JSON.stringify(this._value));
        }
    }

    /**
     * Value
     * @type {object}
     */
    get value() {
        return this._value;
    }

    /**
     * Value
     * @type {object}
     */
    set value(value) {
        value = this._convertValue(value);
        this._value = value;
        this._showValue();
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.ObjectViewer', '#{ui-viewers-object}');