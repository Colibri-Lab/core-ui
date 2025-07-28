/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Editor
 */
Colibri.UI.ToggleBoxEditor = class extends Colibri.UI.Editor {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */ 
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-togglebox-editor-component');

        this._input = new Colibri.UI.ToggleBox(this.name + '-input', this);
        this._input.shown = true;

        this._input.AddHandler('Changed', this.__thisBubble, false, this);
        this._input.AddHandler('LoosedFocus', this.__thisBubble, false, this);
        this._input.AddHandler('ReceiveFocus', this.__thisBubble, false, this);

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
        return this._fieldData.readonly;
    }  
 
    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        this._fieldData.readonly = value === true || value === 'true';
        this._input.readonly = value === true || value === 'true';
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.label;
    }

    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        this._input.label = value ? value[Lang.Current] ?? value : '';
    }

    /**
     * Value
     * @type {boolean}
     */
    get value() {
        return this._input.checked;
    }

    /**
     * Value
     * @type {boolean}
     */
    set value(value) {
        this._input.checked = value === true || value === 1;
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
        return this._input.enabled;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        if(value) {
            this.RemoveClass('ui-disabled');
            this._input.enabled = true;
        }
        else {
            this.AddClass('ui-disabled');
            this._input.enabled = false;
        }
    }

    /**
     * Focus on editor
     */
    Focus() {
        this._input.Focus();
    }

}
Colibri.UI.Editor.Register('Colibri.UI.ToggleBoxEditor', '#{ui-editors-togglebox}');