/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Number = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {
        
        this.AddClass('app-component-number-field');

        this._original = null;

        const contentContainer = this.contentContainer;

        const params = {type: 'number', name: (this.form && this.form.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input')};
        if(this.form && this.form.shuffleFieldNames) {
            params.autocomplete = 'off';
        }
        this._input = contentContainer.container.append(Element.create('input', params));

        this._input.addEventListener('mousewheel', nullhandler);
        this._input.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', {domEvent: e}));
        this._input.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', {domEvent: e}));
        this._input.addEventListener('change', (e) => {
            if(this.max !== null && this._input.value > this.max) {
                this._input.value = this.max;
            }
            if(this.min !== null && this._input.value < this.min) {
                this._input.value = this.min;
            }
            if(this._original != this._input.value) {
                this.Dispatch('Changed', {domEvent: e, component: this, original: this._original});
            }
            this._original = this._input.value;
        });
        this._input.addEventListener('keyup', (e) => {
            this.Dispatch('KeyUp', {domEvent: e});
            if( (this._fieldData?.params?.changeOnKeyPress ?? false) ) {
                if(this._keyUpChangeTimer !== -1) {
                    clearTimeout(this._keyUpChangeTimer);
                }
                this._keyUpChangeTimer = setTimeout(() => {
                    this._input.emitHtmlEvents('change');
                }, 500);
            }
        });
        this._input.addEventListener('keydown', (e) => {
            if(e.keyCode === 38 || e.keyCode === 40) {
                return nullhandler(e);
            }
            return this.Dispatch('KeyDown', {domEvent: e});
        });
        this._input.addEventListener('click', (e) => {
            this.Focus();
            this.Dispatch('Clicked', {domEvent: e})
            e.stopPropagation();
            return false;
        });
        this._input.addEventListener('paste', (e) => {
            Colibri.Common.Delay(100).then(() => {
                this._input.emitHtmlEvents('change');
                this._original = this._input.value;
                this.Dispatch('Pasted', { domEvent: e });
            });
            e.stopPropagation();
            return false;
        });

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        if(this._fieldData?.params?.max !== undefined) {
            this.max = this._fieldData?.params?.max;
        }
        if(this._fieldData?.params?.min !== undefined) {
            this.min = this._fieldData?.params?.min;
        }

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }
    /**
     * Focus on component
     */
    Focus() {
        this._input.focus();
        // this._input.select();
    }

    /**
     * Field is readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.attr('readonly') === 'readonly';
    }

    /**
     * Field is readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this._input.attr('readonly', 'readonly');
            this.AddClass('app-component-readonly');
        }
        else {
            this._input.attr('readonly', null);
            this.RemoveClass('app-component-readonly');
        }
    }

    /**
     * Field placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.attr('placeholder');
    }

    /**
     * Field placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.attr('placeholder', value);
    }

    /**
     * Value
     * @type {number}
     */
    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && value === '') {
            value = null;
        }
        return this._convertValue(value, false);
    }

    /**
     * Value
     * @type {number}
     */
    set value(value) {
        this._original = value;
        if(value === '' || value === null) {
            this._input.value = '';
        }
        else {
            this._input.value = this._convertValue(value, true) ?? '';
        }
    }

    /** @private */
    _convertValue(value, direction = true) {
        this._isShare = this._fieldData?.params?.isShare ?? false;
        if(direction) {
            if(this._fieldData?.params?.format === 'percent') {
                value = value * (this._isShare ? 100 : 1);
            }
             
        } else {
            if(this._isShare && value !== '') {
                value = value / 100;
            }
        }
        
        if(value !== '' && value !== null && this._fieldData?.params?.decimal !== undefined) {
            try {
                value = (value * 1.0).toFixed(this._fieldData?.params?.decimal);
            } catch(e) {
                // console.log(e, value)
            }
        } 
        return value;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */ 
    get enabled() {
        return this._input.attr('disabled') != 'disabled';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */ 
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this.RemoveClass('app-component-disabled');
            this._input.attr('disabled', null);
        }
        else {
            this.AddClass('app-component-disabled');
            this._input.attr('disabled', 'disabled');
        }
    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    /**
     * Tab index
     * @type {number|boolean}
     */
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

    /**
     * Maximum allowed value
     * @type {Number}
     */
    get max() {
        return this._input.attr('max');
    }
    /**
     * Maximum allowed value
     * @type {Number}
     */
    set max(value) {
        this._input.attr('max', value);
    }

    /**
     * Minimum allowed value
     * @type {Number}
     */
    get min() {
        return this._input.attr('min');
    }
    /**
     * Minimum allowed value
     * @type {Number}
     */
    set min(value) {
        this._input.attr('min', value);
    }


}
Colibri.UI.Forms.Field.RegisterFieldComponent('Number', 'Colibri.UI.Forms.Number', '#{ui-fields-number}')