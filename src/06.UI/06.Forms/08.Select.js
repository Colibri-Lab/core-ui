/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Select = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-select-field');


        const contentContainer = this.contentContainer;

        this._input = this._createSelector();

        this._initializeValues();

        this._input.shown = true;
        this.placeholder = this._fieldData.placeholder;
        if(this._fieldData?.params?.placeholderinfo) {
            this.placeholderinfo = this._fieldData.params.placeholderinfo;
        }

        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('Clicked', (event, args) => this.Dispatch('Clicked', args));

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.searchable === undefined) {
            this.searchable = false;    
        }
        else {
            this.searchable = this._fieldData?.params?.searchable;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        if(this._fieldData?.params?.showToolTip) {
            this._input.showToolTip = this._fieldData?.params?.showToolTip;
        }

        if(this._fieldData?.selector?.ondemand) {
            this._input.__BeforeFilled = () => {
                return new Promise((resolve, reject) => {
                    if (this._fieldData.lookup) {
                        this.loading = true;
                        this.AddClass('app-select-loading');
                        this._setLookup(this._fieldData.lookup).then((response) => {
                            this.values = response.result || response;
                        }).finally(() => {
                            this.loading = false;                        
                            this.RemoveClass('app-select-loading');
                            this._setEnabled();
                            resolve(this._fieldData?.selector?.ondemand);
                        });
                    }
                });
            };
        }

        if(this._fieldData?.values) {
            this.values = this._fieldData?.values ?? [];
        }

    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('LookupCompleted', false, 'When lookup finalized');
    }

    /**
     * Reload values to component
     */
    ReloadValues() {
        this.values = this._fieldData.values;
        if (this._fieldData.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');
            this._setLookup(this._fieldData.lookup).then((response) => {
                this.values = response.result || response;
            }).finally(() => {
                this.loading = false;

                this.value = this.value ? this._input._findValue(this.value) : (this._fieldData.default ?? null);

                this.RemoveClass('app-select-loading');
                this._setEnabled();
                this.Dispatch('Changed');
            });
        }
    }

    /** @protected */
    _getDependsValue(type = null) {
        if (this.root && this._fieldData?.lookup) {

            if((type && !this._fieldData.lookup[type]['depends']) || (!type && !this._fieldData.lookup['depends'])) {
                return;
            }

            let dependsField = type ? this._fieldData.lookup[type]['depends'] : this._fieldData.lookup['depends'];
            if (dependsField) {
                dependsField = dependsField.replaceAll('{', '').replaceAll('}', '');
                let rootValues = this.root?.value;
                if(eval(`typeof rootValues?.${dependsField}`) !== 'undefined') {
                    return eval(`rootValues.${dependsField}`);
                }
                const parentValues = this.parentField?.value;
                if(eval(`typeof parentValues?.${dependsField}`) !== 'undefined') {
                    return eval(`parentValues.${dependsField}`);
                }
                return null;
            }
        }
    }

    /**
     * Run lookup
     * @param {(Object|function)} value
     */
    _setLookup(value) {
        this._lookup = value;
        return Colibri.UI.GetLookupPromise(this, this._lookup, this._input._input.value, (type = null) => {
            return this._getDependsValue(type);
        });
    }

    /**
     * Values
     * @param {Array} value
     */
    set values(value) {
        value = this._convertProperty('Array', value);
        let required = this._fieldData?.params?.required;
        let multiple = this._fieldData?.params?.multiple;
        if(required === undefined) {
            required = false;
        }
        if(multiple === undefined) {
            multiple = false;
        }
        if(!required && !multiple) {
            const o = {};
            o[this._fieldData?.selector?.title ?? 'title'] = Lang.Translate(this._fieldData?.selector?.emptytitle) ?? '---';
            o[this._fieldData?.selector?.value ?? 'value'] = this._fieldData?.selector?.emptyvalue ?? 0;
            value = isIterable(value) ? [o, ...value] : [o];
        }
        this._input.values = value;
    }

    /**
     * Values
     * @param {Array} value
     */
    get values() {
        return this._input.values;
    }

    /**
     * Focus on component
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Field is readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.readonly;
    }
    /**
     * Field is readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._input.readonly = value;
        if(this._input.readonly) {
            this.AddClass('app-component-readonly');
        } else {
            this.RemoveClass('app-component-readonly');
        }
    }

    /**
     * Can search in select items
     * @type {bool}
     */
    get searchable() {
        return this._input.searchable;
    }
    /**
     * Can search in select items
     * @type {bool}
     */
    set searchable(value) {
        value = this._convertProperty('Boolean', value);
        this._input.searchable = value;
    }

    /**
     * Field placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.placeholder;
    }
    /**
     * Field placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.placeholder = value;
    }

    /**
     * Field placeholder info
     * @type {object}
     */
    get placeholderinfo() {
        return this._input.placeholderinfo;
    }
    /**
     * Field placeholder info
     * @type {object}
     */
    set placeholderinfo(value) {
        this._input.placeholderinfo = value;
    }

    /**
     * Field empty placeholder generator 
     * @type {Function}
     */
    get placeholderempty() {
        return this._input.placeholderempty;
    }
    /**
     * Field empty placeholder generator 
     * @type {Function}
     */
    set placeholderempty(value) {
        this._input.placeholderempty = value;
    }

    /**
     * Value
     * @type {*}
     */
    get value() {
        let value = this._lastValue || this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(Array.isArray(value)) {
            value = value.map((v) => v ? v[this._fieldData.selector?.value ?? 'value'] ?? v : null);
        }
        else if(Object.isObject(value)) {
            value = value[this._fieldData.selector?.value ?? 'value'] ?? value;
        }
        return value;
    }
    /**
     * Value
     * @type {*}
     */
    set value(value) {
        if(this.loading === true) {
            this._lastValue = value;
        } else {
            this._input.value = value;
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
        value = this._convertProperty('Boolean', value);
        if(value) {
            this.RemoveClass('app-component-disabled');
        }
        else {
            this.AddClass('app-component-disabled');
        }
        this._input.enabled = value;
    }
    /** @private */
    _setEnabled() {
        if(!this.value && this._fieldData.default) {
            this.value = this._fieldData.default;
        }
    }

    /** @private */
    _initializeValues() {
        if (this._fieldData.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');

            //delay для того чтобы в форму были загружены значения зависимых полей
            Colibri.Common.Delay(this.root ? 100 : 0).then(() => {
                this._setLookup(this._fieldData.lookup).then((response) => {
                    this.values = response.result || response;
                }).finally(() => {
                    this.loading = false;
                    let isChanged = false;
                    if(this._lastValue) {
                        this.value = this._lastValue;
                        this._lastValue = null;
                    } else {
                        this._input._renderValue(false);
                    }
                    this.RemoveClass('app-select-loading');
                    this._setEnabled();        
                    this.Dispatch('LookupCompleted');
                });
            });
        } else {
            this._setEnabled();
        }
    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Tab index
     * @type {number|boolean}
     */
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value;
        }
    }

    /**
     * Popup configuration
     * @type {object}
     */
    set popupconfig(value) {
        this._input.popupconfig = value;
    }
    /**
     * Popup configuration
     * @type {object}
     */
    get popupconfig() {
        return this._input.popupconfig;
    }

    /** @private */
    _createSelector() {

        return new Colibri.UI.Selector(
            'input',
            this.contentContainer,
            this._fieldData.multiple ?? this._fieldData?.params?.multiple ?? false,
            this._fieldData.params?.readonly ?? false,
            this._fieldData.params?.searchable ?? false,
            this._fieldData.values,
            this._fieldData.default,
            this._fieldData.selector?.title ?? 'title',
            this._fieldData.selector?.value ?? 'value',
            this._fieldData.selector?.group ?? null,
            this._fieldData.selector?.__render ?? null,
            ((this._fieldData.allowempty ?? this._fieldData?.params?.allowempty) === undefined ? true : (this._fieldData.allowempty ?? this._fieldData?.params?.allowempty)),
            ((this._fieldData.clearicon ?? this._fieldData?.params?.clearicon) === undefined ? false : (this._fieldData.clearicon ?? this._fieldData?.params?.clearicon))
        );
    }
    
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Select', 'Colibri.UI.Forms.Select', '#{ui-fields-select}', null, ['required','enabled','canbeempty','readonly','searchable','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])
