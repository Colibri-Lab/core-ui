/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Text = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-text-field');

        this._original = null;

        const contentContainer = this.contentContainer;
        const params = {type: 'text', name: (this?.form?.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input')};
        if(this?.form?.shuffleFieldNames) {
            params.autocomplete = 'off';
        }
        this._input = contentContainer.container.append(Element.create('input', params));

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
        this.maxlength = this._fieldData?.params?.maxlength ?? null;
        this.value = this._fieldData?.default ?? '';

        const mask = this._fieldData?.params?.mask;
        if(mask) {
            this._masker = new Colibri.UI.Utilities.Mask([this._input]);
            this._masker.maskPattern(mask);
        } 

        if(this._fieldData?.params?.icon) {
            this.icon = this._fieldData?.params?.icon;
        }

        this._input.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', {domEvent: e}));
        this._input.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', {domEvent: e}));
        this._input.addEventListener('change', (e) => {
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
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input.addEventListener('paste', (e) => {
            Colibri.Common.Delay(100).then(() => {
                this._input.emitHtmlEvents('change');
                this._original = this._input.value;
                this.Dispatch('Pasted', { domEvent: e });
            });
            e.stopPropagation();
            return false;
        });
        this._input.addEventListener('click', (e) => {
            this.Focus();
            this.Dispatch('Clicked', {domEvent: e});
            e.stopPropagation();
            return false;
        });

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
        //this._input.select();
    }

    /**
     * Maximum length of value
     * @type {number}
     */
    set maxlength(value) {
        value = this._convertProperty('Number', value);
        this._input.attr('maxlength', value);
    }
    /**
     * Maximum length of value
     * @type {number}
     */
    get maxlength() {
        return this._input.attr('maxlength');
    }

    /**
     * Is field readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.attr('readonly') === 'readonly';
    }
    /**
     * Is field readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this._input.attr('readonly', 'readonly');
        }
        else {
            this._input.attr('readonly', null);
        }
    }
    /**
     * Input placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.attr('placeholder');
    }
    /**
     * Input placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.attr('placeholder', value);
        if(value) {
            this.AddClass('-has-placeholder');
        }
        else {
            this.RemoveClass('-has-placeholder');
        }
    }

    /**
     * Input value
     * @type {string}
     */
    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(this._fieldData?.params?.eval) {
            value = eval(this._fieldData?.params?.eval);
        }
        return value;
    }
    /**
     * Input value
     * @type {string}
     */
    set value(value) {
        this._original = value;
        this._input.value = value ?? '';
    }

    /**
     * Enable/Disable component
     * @type {boolean}
     */
    get enabled() {
        return this._input.attr('disabled') != 'disabled';
    }
    /**
     * Enable/Disable component
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
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

    /**
     * Icon on input
     * @type {string}
     */
    set icon(value) {
        this._icon = value;
        this._showIcon();
    }
    /**
     * Icon on input
     * @type {string}
     */
    get icon() {
        value = this._convertProperty('String', value);
        return this._icon;
    }
    /** @private */
    _showIcon() {
        const contentContainer = this.contentContainer;
        if(!this._icon) {
            this.RemoveClass('-has-icon');
            contentContainer.Children('icon').Dispose();
            return;
        }

        const icon = new Colibri.UI.Icon(this._name + '-icon', contentContainer);
        icon.value = this._icon;
        icon.shown = true;

        this.AddClass('-has-icon');

    }
}

Colibri.UI.Forms.Field.RegisterFieldComponent('Text', 'Colibri.UI.Forms.Text', '#{ui-fields-text}');
