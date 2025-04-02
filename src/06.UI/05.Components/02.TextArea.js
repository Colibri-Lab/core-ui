/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TextArea = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div', {class: 'app-ui-component'}));

        this.AddClass('app-textarea-component');

        this._input = Element.create('textarea', { placeholder: this.placeholder || '' });
        this._element.append(this._input);

        this._changeOnKeyUpTimeout = 3000;

        new Colibri.UI.Pane('clear', this);

        this.Children('clear').html = Colibri.UI.ClearIcon;

        this._input.addEventListener('keyup', (e) => {
            this.Children('clear').shown = this._input.value.length > 0;
            this.Dispatch('KeyUp', { value: this.value, domEvent: e });
            if (this._input.value.length == 0) {
                this.Dispatch('Cleared');
            }
            if(this._changeOnKeyUp) {
                if(this._changeOnKeyUpTimeoutId) {
                    clearTimeout(this._changeOnKeyUpTimeoutId);
                }
                this._changeOnKeyUpTimeoutId = setTimeout(() => this.Dispatch('Changed', { value: this.value, domEvent: e }), this._changeOnKeyUpTimeout);
            }
        });

        this._input.addEventListener('change', (e) => {
            this.Dispatch('Changed', { value: this.value, domEvent: e });
        });

        this._input.addEventListener('keydown', (e) => {
            this.Dispatch('KeyDown', { value: this.value, domEvent: e });
        });

        this._input.addEventListener('mousedown', (e) => {
            e.target.focus();
            //e.target.select();
            return false;
        });

        this.Children('clear').AddHandler('Clicked', (event, args) => {
            this._input.value = '';
            this._input.focus();
            this._input.select();
            this.Children('clear').shown = false;
            this.Dispatch('Cleared');
        });

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('KeyUp', false, 'Поднимается, когда клавиша поднята');
        this.RegisterEvent('KeyDown', false, 'Поднимается, когда клавиша нажата');
        this.RegisterEvent('Changed', false, 'Поднимается, когда содержимое поля обновлено');
        this.RegisterEvent('Cleared', false, 'Поднимается, когда содержимое поля очищено с помощью крестика');
    }

    /**
     * Focus on component
     * @returns this
     */
     Focus() {
        this._input.focus();
        return this;
    }

    /**
     * Maximum length in chars of component 
     * @type {number} 
     */
    get maxlength() {
        return this._input.attr('maxlength');
    }
    /**
     * Maximum length in chars of component 
     * @type {number} 
     */
    set maxlength(value) {
        this._input.attr('maxlength', value);
    }

    /**
     * Textarea placeholder 
     * @type {string} 
     */
    get placeholder() {
        try {
            return this._input.attr('placeholder');
        }
        catch(e) {
            return '';
        }
    }
    /**
     * Textarea placeholder 
     * @type {string} 
     */
    set placeholder(value) {
        this._input.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    /**
     * Value string 
     * @type {string} 
     */
    get value() {
        return this._input.value;
    }
    /**
     * Value string 
     * @type {string} 
     */
    set value(value) {
        this._input.value = value;
        this.Children('clear').shown = this._input.value.length > 0;
    }

    /**
     * Is textarea readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.is(':scope[readonly]');
    }
    /**
     * Is textarea readonly
     * @type {boolean}
     */
    set readonly(value) {
        this._input.attr('readonly', value);
        this.Dispatch('ReadonlyStateChanged');
    }

    /**
     * Change on key up event
     * @type {Boolean}
     */
    get changeOnKeyUp() {
        return this._changeOnKeyUp;
    }
    /**
     * Change on key up event
     * @type {Boolean}
     */
    set changeOnKeyUp(value) {
        this._changeOnKeyUp = value;
    }

    /**
     * Timeout for Change event on KeyUp
     * @type {Number}
     */
    get changeOnKeyUpTimeout() {
        return this._changeOnKeyUpTimeout;
    }
    /**
     * Timeout for Change event on KeyUp
     * @type {Number}
     */
    set changeOnKeyUpTimeout(value) {
        this._changeOnKeyUpTimeout = value;
    }

    /** 
     * Enable/disable input
     * @type {Boolean} 
     */
    get enabled() {
        return super.enabled;
    }
    /** 
     * Enable/disable input
     * @type {Boolean} 
     */
    set enabled(val) {
        val = this._convertProperty('Boolean', val);
        super.enabled = val;
        this._input.attr('disabled', val === true || val === 'true' ? null : 'disabled');
    }

}