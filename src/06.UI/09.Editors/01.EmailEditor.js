/**
 * @class
 * @extends Colibri.UI.Editor
 */
Colibri.UI.EmailEditor = class extends Colibri.UI.Editor {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */ 
    constructor(name, container) {
        super(name, container, Element.create('input'));
        this.AddClass('app-email-editor-component');

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

    /**
     * Validate editor data
     */
    Validate() {
        if(this._element.value && !this._element.value.isEmail()) {
            this.AddClass('-invalid');
            this.toolTip = '#{ui-editors-email-message}';
        }
        else {
            this.RemoveClass('-invalid');
            this.toolTip = '';
        }
    }

    /**
     * Focus on editor
     */
    Focus() {
        this._element.focus();
        // this._element.select();
    } 

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._element.attr('readonly') === 'readonly';
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
        if(value) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }
        this.Validate();
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
Colibri.UI.Editor.Register('Colibri.UI.EmailEditor', '#{ui-editors-email}');