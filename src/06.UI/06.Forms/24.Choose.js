/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Choose = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-choose-field');

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
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        if(this._fieldData?.selector?.openonnote) {
            this.AddClass('-openonnote');
            this._content.Children(this._name + '-note').AddHandler('Clicked', this.__clickOnNote, false, this);
            this._input.openButton = false;
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
                            resolve(true);
                        });
                    }
                });
            };
        }

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clickOnNote(event, args) {
        if(!this.readonly) {
            this._input.ShowChooser();
        }
    }

    /**
     * Focus on component
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.readonly;
    }
    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this.AddClass('app-component-readonly');
        } else {
            this.RemoveClass('app-component-readonly');
        }
        this._input.readonly = value;
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.placeholder;
    }
    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.placeholder = value;
    }

    /**
     * Placeholder info
     * @type {object}
     */
    get placeholderinfo() {
        return this._input.placeholderinfo;
    }
    /**
     * Placeholder info
     * @type {object}
     */
    set placeholderinfo(value) {
        this._input.placeholderinfo = value;
    }

    /**
     * Empty placeholder generator
     * @type {Function}
     */
    get placeholderempty() {
        return this._input.placeholderempty;
    }
    /**
     * Empty placeholder generator
     * @type {Function}
     */
    set placeholderempty(value) {
        this._input.placeholderempty = value;
    }

    /**
     * Value
     * @type {object|string}
     */
    get value() {
        let value = this._input.value ?? null;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(Array.isArray(value)) {
            value = value.map((v) => v[this._fieldData.selector?.value ?? 'value'] ?? v);
        }
        else if(Object.isObject(value)) {
            value = value[this._fieldData.selector?.value ?? 'value'] ?? value;
        }
        if(value === undefined) {
            value = null;
        }
        return value;
    }
    /**
     * Value
     * @type {object|string}
     */
    set value(value) {
        this._input.value = value;
    }

    /**
     * Values
     * @type {Array}
     */
    set values(value) {
        let required = this._fieldData?.params?.required;
        if(required === undefined) {
            required = false;
        }
        if(!required) {
            const o = {};
            o[this._fieldData?.selector?.title] = '---';
            o[this._fieldData?.selector?.value] = 0;
            value = isIterable(value) ? [o, ...value] : [o];
        }
        this._input.values = value;
    }

    /**
     * Values
     * @type {Array}
     */
    get values() {
        return this._input.values;
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
        this._input.enabled = value;
    }
    /** @private */
    _setEnabled() {
        if(!this.value && this._fieldData.default) {
            this.value = this._fieldData.default;
        }
    }

    /**
     * Run lookup
     * @param {Object|Function} value
     */
    _setLookup(value) {
        this._lookup = value;
        return Colibri.UI.GetLookupPromise(this, this._lookup, this._input._input.value, (type = null) => {
            return this._getDependsValue(type);
        });
    }

    /** @private */
    _getDependsValue(type = null) {
        if (this.root && this._fieldData?.lookup) {

            if((type && !this._fieldData.lookup[type]['depends']) || (!type && !this._fieldData.lookup['depends'])) {
                return;
            }

            let dependsField = type ? this._fieldData.lookup[type]['depends'] : this._fieldData.lookup['depends'];
            if (dependsField) {
                dependsField = dependsField.replaceAll('{', '').replaceAll('}', '');
                const rootValues = this.root?.value;
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
                    if(this._lastValue) {
                        this.value = this._lastValue;
                        this._lastValue = null;
                    } else {
                        this._input._renderValue();
                    }
                    this.RemoveClass('app-select-loading');
                    this._setEnabled();
                });
            });
        } else {
            this._setEnabled();
        }
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
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
    get popupconfig() {
        return this._input.popupconfig;
    }

    /** @private */
    _createSelector() {
        return new Colibri.UI.Chooser(
            'input',
            this.contentContainer,
            this._fieldData.multiple ?? this._fieldData?.params?.multiple ?? false,
            this._fieldData.readonly,
            this._fieldData.placeholder,
            this._fieldData.selector,
            this._fieldData.default,
            ((this._fieldData?.params?.allowempty ?? this._fieldData?.allowempty) === undefined ? true : (this._fieldData?.params?.allowempty ?? this._fieldData?.allowempty)),
            ((this._fieldData?.params?.clearicon ?? this._fieldData?.clearicon) === undefined ? false : (this._fieldData?.params?.clearicon ?? this._fieldData?.clearicon))
        );
    }

    /**
     * Value object
     * @type {object}
     * @readonly
     */
    get valueObject() {
        return this._input.valueObject;
    }
    
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Choose', 'Colibri.UI.Forms.Choose', '#{ui-fields-choose}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler']);
