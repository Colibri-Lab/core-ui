/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Editor
 */
Colibri.UI.CheckboxListEditor = class extends Colibri.UI.Editor {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */ 
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-checkbox-editor-component');
        
        this._inputs = [];

        // this._input = new Colibri.UI.Checkbox(this.name + '-input', this);
        // this._input.shown = true;

        // this._input.AddHandler('Changed', this.__thisBubble, false, this);
        // this._input.AddHandler('LoosedFocus', this.__thisBubble, false, this);
        // this._input.AddHandler('ReceiveFocus', this.__thisBubble, false, this);

    }

    /**
     * Validate
     */
    Validate() {
        
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._inputs.every(input => input.readonly);
    }  
 
    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        if(this._fieldData) {
            this._fieldData.readonly = value === true || value === 'true';
        }
        this._inputs.forEach(input => input.readonly = value === true || value === 'true');
    }

    /**
     * Value
     * @type {Array}
     */
    get value() {
        return this._inputs.map(input => ({ value: input.tag, title: input.placeholder, checked: input.checked }));
    }

    /**
     * Value
     * @type {Array}
     */
    set value(value) {
        for(const v of value) {
            const c = new Colibri.UI.Checkbox(this.name + '-input-' + String.MD5(v.value + v.title), this)
            c.shown = true;
            c.checked = v.checked;
            c.placeholder = v.title;
            c.tag = v.value;
            c.AddHandler('Changed', this.__thisBubble, false, this);
            this._inputs.push(c);
        }
        this.Validate();
        if(value) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._inputs.every(input => input.enabled);
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        if(value) {
            this.RemoveClass('ui-disabled');
            this._inputs.forEach(input => input.enabled = true);
        }
        else {
            this.AddClass('ui-disabled');
            this._inputs.forEach(input => input.enabled = false);
        }
    }

    /**
     * Focus on editor
     */
    Focus() {
        this._inputs[0]?.Focus();
    }

}
Colibri.UI.Editor.Register('Colibri.UI.CheckboxListEditor', '#{ui-editors-checkboxlist}');