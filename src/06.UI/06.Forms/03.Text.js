/**
 * Text field component
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * form.fields = {
 *      'name': {
 *          'component': 'Text',
 *          'desc': 'Name',
 *          'default': 'John Doe'
 *      }
 * };
 * form.value = {
 *      'name': 'Jane Doe'
 * };
 * form.AddHandler('Changed', (event, args) => {
 *      console.log('Form changed', form.value);
 * });
 * 
 * in html template
 * 
 * <Forms.Form name="form" fields="fields" value="value">
 *     <fields>
 *      {
 *          'name': {
 *              'component': 'Text',
 *              'desc': 'Name',
 *              'default': 'John Doe'
 *          }
 *      }
 *     </fields>
 * </Forms.Form>
 * 
 * ```
 */
Colibri.UI.Forms.Text = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     * @protected
     * @ignore
     */
    RenderFieldContainer() {

        this.AddClass('app-component-text-field');

        this._original = null;

        const contentContainer = this.contentContainer;
        const params = { type: 'text', name: (this?.form?.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input') };
        if (this?.form?.shuffleFieldNames) {
            params.autocomplete = 'off';
        }
        this._input = contentContainer.container.append(Element.create('input', params));

        if (this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if (this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }
        this.maxlength = this._fieldData?.params?.maxlength ?? null;
        this.value = this._fieldData?.default ?? '';

        const mask = this._fieldData?.params?.mask;
        if (mask) {
            this._masker = new Colibri.UI.Utilities.Mask([this._input]);
            this._masker.maskPattern(mask);
        }

        if (this._fieldData?.params?.pattern) {
            this._input.attr('pattern', this._fieldData?.params?.pattern);
        }

        if (this._fieldData?.params?.inputmode) {
            this._input.attr('inputmode', this._fieldData?.params?.inputmode);
        }

        if (this._fieldData?.params?.icon) {
            this.icon = this._fieldData?.params?.icon;
        }


        this._input.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', { domEvent: e }));
        this._input.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', { domEvent: e }));
        this._input.addEventListener('change', (e) => {
            if (this._original != this._input.value) {
                this.Dispatch('Changed', { domEvent: e, component: this, original: this._original });
            }
            this._original = this._input.value;
        });
        this._input.addEventListener('keyup', (e) => {
            this.Dispatch('KeyUp', { domEvent: e });
            if ((this._fieldData?.params?.changeOnKeyPress ?? false)) {
                if (this._keyUpChangeTimer !== -1) {
                    clearTimeout(this._keyUpChangeTimer);
                }
                this._keyUpChangeTimer = setTimeout(() => {
                    this._input.emitHtmlEvents('change');
                }, 500);
            }
        });
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', { domEvent: e }));
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
            this.Dispatch('Clicked', { domEvent: e });
            e.stopPropagation();
            return false;
        });

        this.AddHandler('LoosedFocus', this.__thisLoosedFocus);
        this.AddHandler('ReceiveFocus', this.__thisReceiveFocus);

    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    /**
     * Focus on component
     * @public
     */
    Focus() {
        this._input.focus();
    }

    /**
     * Select text in component
     * @public
     */
    Select() {
        this._input.select();
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
        if (value) {
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
        if (value) {
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
        if (this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if (this._fieldData?.params?.eval) {
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
        if (value) {
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
    /** 
     * @ignore
     * @private 
     */
    _showIcon() {
        const contentContainer = this.contentContainer;
        if (!this._icon) {
            this.RemoveClass('-has-icon');
            contentContainer.Children('icon').Dispose();
            return;
        }

        const icon = new Colibri.UI.Icon(this._name + '-icon', contentContainer);
        icon.value = this._icon;
        icon.shown = true;

        this.AddClass('-has-icon');

    }

    /**
     * Pattern string for input
     * @type {String}e
     */
    get pattern() {
        return this._input.attr('pattern');
    }
    /**
     * Pattern string for input
     * @type {String}
     */
    set pattern(value) {
        this._input.attr('pattern', value);
    }

    /**
     * Input mode for input
     * @type {String}
     */
    get inputmode() {
        return this._input.attr('inputmode');
    }
    /**
     * Input mode for input
     * @type {String}
     */
    set inputmode(value) {
        this._input.attr('inputmode', value);
    }


    /** 
     * @private
     * @ignore
     */
    _showSuggestions() {
        if (this._fieldData.lookup) {
            this._setLookup(this._fieldData.lookup).then((response) => {
                const values = response.result || response;
                if (!this._popup) {
                    this._popup = this._createPopup(values);
                }
                this._popup.Show();
            });
        }
    }

    /** 
     * @ignore
     * @private 
     */
    _createPopup(values) {
        const popup = new Colibri.UI.PopupList('select-popup', document.body, false, this.__render, this._fieldData?.selector?.title, this._fieldData?.selector?.title);
        popup.parent = this;
        popup.multiple = false;
        const el = this.contentContainer.container.closest('[namespace]');
        el && popup.container.attr('namespace', el.attr('namespace'));
        popup.__renderElement = (itemData, item) => {
            return itemData[this._fieldData?.selector?.title] ?? '';
        };
        //заполнение списка перед хэндлерами, чтобы не сработал SelectionChanged
        popup.FillItems(values, this._value);
        popup.AddHandler('ItemMouseDown', this.__popupMouseDown, false, this);
        return popup;
    }

    /**
     * @private
     * @ignore
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __popupMouseDown(event, args) {
        this.value = args.item.value?.[this._fieldData?.selector?.value];
        this.Dispatch('Changed', { domEvent: args.domEvent, component: this, original: this._original });

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisReceiveFocus(event, args) {
        this._showSuggestions();
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisLoosedFocus(event, args) {
        if (this._popup) {
            this._popup.Hide();
            // this._popup.Dispose();
            // this._popup = null;
        }
    }

    /**
     * Run lookup
     * @param {(Object|function)} value
     * @returns {Promise}
     * @private
     * @ignore
     * @async
     */
    _setLookup(value) {
        this._lookup = value;
        return Colibri.UI.GetLookupPromise(this, this._lookup, this._input.value, (type = null) => {
            return this._getDependsValue(type);
        }, this._lastValue);
    }

    /**
     * @ignore 
     * @protected 
     */
    _getDependsValue(type = null) {
        if (this.root && this._fieldData?.lookup) {

            if ((type && !this._fieldData.lookup[type]['depends']) || (!type && !this._fieldData.lookup['depends'])) {
                return;
            }

            let dependsField = type ? this._fieldData.lookup[type]['depends'] : this._fieldData.lookup['depends'];
            if (dependsField) {
                dependsField = dependsField.replaceAll('{', '').replaceAll('}', '');
                let rootValues = this.root?.value;
                if (eval(`typeof rootValues?.${dependsField}`) !== 'undefined') {
                    return eval(`rootValues.${dependsField}`);
                }
                const parentValues = this.parentField?.value;
                if (eval(`typeof parentValues?.${dependsField}`) !== 'undefined') {
                    return eval(`parentValues.${dependsField}`);
                }
                return null;
            }
        }
    }

}

Colibri.UI.Forms.Field.RegisterFieldParam('Colibri.UI.Forms.Text', 'mask', {
    type: 'varchar',
    placeholder: '#{ui-fields-fieldparams-mask}',
    note: '#{ui-fields-fieldparams-mask-note}',
    component: 'Text',
    default: '',
    params: {
        condition: {
            field: 'component',
            method: (fieldValue, data, type, empty, inverse, fieldData) => Colibri.UI.Forms.Field.HasParam(fieldValue, 'mask')
        }
    }
});

Colibri.UI.Forms.Field.RegisterFieldComponent('Text', 'Colibri.UI.Forms.Text', '#{ui-fields-text}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'mask', 'fieldgenerator', 'generator', 'transformer', 'transformer', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler']);
