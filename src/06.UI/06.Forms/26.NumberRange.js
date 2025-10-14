/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.NumberRange = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {
        
        this.AddClass('app-component-numberrange-field');

        this._original = null;

        const contentContainer = this.contentContainer;

        const params = {type: 'number', name: (this.form && this.form.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input')};
        if(this.form && this.form.shuffleFieldNames) {
            params.autocomplete = 'off';
        }

        this._input1 = contentContainer.container.append(Element.create('input', params));
        this._input2 = contentContainer.container.append(Element.create('input', params));

        this._input1.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', {domEvent: e}));
        this._input1.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', {domEvent: e}));
        this._input1.addEventListener('change', (e) => {
            const oldValue = this._original ? this._original[0] : null;
            if(oldValue != this._input1.value) {
                this.Dispatch('Changed', {domEvent: e, component: this});
            }
            this._original = [this._input1.value, this._input2.value];
        });
        this._input1.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input1.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input1.addEventListener('click', (e) => {
            this.Dispatch('Clicked', {domEvent: e})
            e.stopPropagation();
            return false;
        });
        this._input1.addEventListener('paste', (e) => {
            Colibri.Common.Delay(100).then(() => {
                this._input1.emitHtmlEvents('change');
                this._original = [this._input1.value, this._input2.value];
                this.Dispatch('Pasted', { domEvent: e });
            });
            e.stopPropagation();
            return false;
        });

        this._input2.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', {domEvent: e}));
        this._input2.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', {domEvent: e}));
        this._input2.addEventListener('change', (e) => {
            const oldValue = this._original ? this._original[1] : null;
            if(oldValue != this._input2.value) {
                this.Dispatch('Changed', {domEvent: e, component: this});
            }
            this._original = [this._input1.value, this._input2.value];
        });
        this._input2.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input2.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input2.addEventListener('click', (e) => {
            this.Dispatch('Clicked', {domEvent: e})
            e.stopPropagation();
            return false;
        });
        this._input2.addEventListener('paste', (e) => {
            Colibri.Common.Delay(100).then(() => {
                this._input1.emitHtmlEvents('change');
                this._original = [this._input1.value, this._input2.value];
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
        this._input1.focus();
        // this._input1.select();
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input1.attr('readonly') === 'readonly';
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this._input1.attr('readonly', 'readonly');
            this._input2.attr('readonly', 'readonly');
        }
        else {
            this._input1.attr('readonly', null);
            this._input2.attr('readonly', null);
        }
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._placeholder;
    }

    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._placeholder = value;
        this._input1.attr('placeholder', this._placeholder ? this._placeholder + ' (#{ui-fields-numberrange-from})' : '#{ui-fields-numberrange-from}');
        this._input2.attr('placeholder', this._placeholder ? this._placeholder + ' (#{ui-fields-numberrange-to})' : '#{ui-fields-numberrange-to}');
    }

    /**
     * Value
     * @type {Array}
     */
    get value() {
        let value1 = this._input1.value;
        if(this._fieldData?.params?.emptyAsNull && value === '') {
            value1 = null;
        }
        let value2 = this._input2.value;
        if(this._fieldData?.params?.emptyAsNull && value === '') {
            value2 = null;
        }
        return [this._convertValue(value1, false), this._convertValue(value2, false)];
    }

    /**
     * Value
     * @type {Array}
     */
    set value(value) {

        if(!Array.isArray(value)) {
            value = [value ?? '', ''];
        }

        value = this._convertValue(value, true);

        this._original = value;
        this._input1.value = value[0];
        this._input2.value = value[1];
    }

    /** @private */
    _convertValue(value, direction = true) {
        if(this._fieldData?.params?.format === 'percent') {
            value = direction ? value * (value <= 1 ? 100 : 1) : value / (value <= 1 ? 100 : 1);
        }
        return value;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._input1.attr('disabled') != 'disabled';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this.RemoveClass('app-component-disabled');
            this._input1.attr('disabled', null);
        }
        else {
            this.AddClass('app-component-disabled');
            this._input1.attr('disabled', 'disabled');
        }
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input1 && this._input1.attr('tabIndex');
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        this._input1 && this._input1.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
        this._input2 && this._input2.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('NumberRange', 'Colibri.UI.Forms.NumberRange', '#{ui-fields-numberrange}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])