/**
 * @class
 * @extends Colibri.UI.Editor
 * @memberof Colibri.UI
 */
Colibri.UI.TextEditor = class extends Colibri.UI.Editor {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */ 
    constructor(name, container) {
        super(name, container, Element.create('input'));
        this.AddClass('app-text-editor-component');
        
        this._element.addEventListener('focus', (e) => this.Focus());
        this._element.addEventListener('blur', (e) => this.Blur());
        this._element.addEventListener('change', (e) => this.__elementChanged(e));
        this._element.addEventListener('keydown', (e) => this.__elementChanged(e));


    }

    /** @private */
    __elementChanged(e) {
        if(this.value) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }

    }

    /** @private */
    _updateFieldData() {
        this.placeholder = this._fieldData?.placeholder;
    }

    /**
     * Validate editor
     */
    Validate() {
        
    }

    /**
     * Focus on editor
     */
    Focus() {
        this._element.focus();
        // this._element.select();
        this.parent.parent.AddClass('-focused');
    } 

    /**
     * Remove focus from editor
     */
    Blur() {
        return this._element.attr('readonly') === 'readonly';
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._fieldData?.readonly;
    }  
 
    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        if(this._fieldData) {
            this._fieldData.readonly = value === true || value === 'true';
        }
        if(value === true || value === 'true') {
            this._element.attr('readonly', 'readonly');
        }
        else {
            this._element.attr('readonly', null);
        }
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._element.attr('placeholder');
    }

    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        this._element.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return this._element.value;
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        this._element.value = value;
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
        return this._element.attr('disabled') != 'disabled';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        if(value) {
            this.RemoveClass('ui-disabled');
            this._element.attr('disabled', null);
        }
        else {
            this.AddClass('ui-disabled');
            this._element.attr('disabled', 'disabled');
        }
    }

}
Colibri.UI.Editor.Register('Colibri.UI.TextEditor', '#{ui-editors-text}');