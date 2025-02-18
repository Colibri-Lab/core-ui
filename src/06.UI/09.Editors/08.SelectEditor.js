/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Editor
 */
Colibri.UI.SelectEditor = class extends Colibri.UI.Editor {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */ 
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-select-editor-component');
        
        


    }

    /**
     * Validate editor
     */
    Validate() {
        
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this.field.readonly;
    }  
 
    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        this.field.readonly = value === true || value === 'true';
        this._input.readonly = value === true || value === 'true';
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
        this._input.placeholder = value ? value[Lang.Current] ?? value : '';
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        try {
            return this._input?.value[this._input._valueField ?? 'value'];
        } catch(e) {
            return null;
        }
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        Colibri.Common.Wait(() => !this.loading).then(() => {
            this._input.value = value;
            this.Validate();
            if(value) {
                this._setFilled();
            } else {
                this._unsetFilled();
            }
        });
        
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
     * Field object
     * @type {Object}
     */
    get field() {
        return super.field;
    }
    /**
     * Field object
     * @type {Object}
     */
    set field(value) {
        super.field = value;
        this._showField();
    }
    /** @private */
    _showField() {
        if(!this._input) {
            this._input = this._createSelector();
            this._input.shown = true;
            this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
            this._input.AddHandler('ReceiveFocus', (event, args) => {
                this.parent.parent.AddClass('-focused');
            });
            this._input.AddHandler('LoosedFocus', (event, args) => this.parent.parent.RemoveClass('-focused'));
            this._initializeValues();
            if(this.field?.params?.readonly === undefined) {
                this.readonly = false;    
            }
            else {
                this.readonly = this.field?.params?.readonly;
            }
            if(this.field?.params?.searchable === undefined) {
                this.searchable = false;    
            }
            else {
                this.searchable = this.field?.params?.searchable;
            }
            if(this.field?.params?.enabled === undefined) {
                this.enabled = true;
            }
            else {
                this.enabled = this.field.params.enabled;
            }

            if(this.field?.params?.values !== undefined) {
                this.values = this.field?.params?.values;
            }

            if(this.field?.params?.value !== undefined) {
                this.value = this.field?.params?.value;
            }

            if(this.field?.selector?.ondemand) {
                this._input.__BeforeFilled = () => {
                    return new Promise((resolve, reject) => {
                        if (this.field.lookup) {
                            this.loading = true;
                            this.AddClass('app-select-loading');
                            this._setLookup(this.field.lookup).then((response) => {
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
        
    }

    /** @private */
    _createSelector() {

        return new Colibri.UI.Selector(
            'input',
            this,
            this.field.multiple ?? this.field?.params?.multiple ?? false,
            this.field.params?.readonly ?? false,
            this.field.params?.searchable ?? false,
            this.field.values,
            this.field.default,
            this.field.selector?.title ?? 'title',
            this.field.selector?.value ?? 'value',
            this.field.selector?.group ?? null,
            this.field.selector?.__render ?? null,
            (this.field.allowempty === undefined ? true : this.field.allowempty),
            (this.field.clearicon === undefined ? false : this.field.clearicon)
        );
    }

    /**
     * Reload values
     */
    ReloadValues() {
        this.values = this.field.values;
        if (this.field.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');
            this._setLookup(this.field.lookup).then((response) => {
                this.values = response.result || response;
            }).finally(() => {
                this.loading = false;

                this.value = this.value ? this._input._findValue(this.value) : (this.field.default ?? null);

                this.RemoveClass('app-select-loading');
                this._setEnabled();
                this.Dispatch('Changed');
            });
        }
    }

    /** @private */
    _getDependsValue(type = null) {
        if (this.root && this.field?.lookup) {

            if((type && !this.field.lookup[type]['depends']) || (!type && !this.field.lookup['depends'])) {
                return;
            }

            let dependsField = type ? this.field.lookup[type]['depends'] : this.field.lookup['depends'];
            if (dependsField) {
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

    /**
     * Set the lookup object
     * @param {(Object|function)} value
     */
    _setLookup(value) {
        this._lookup = value;
        return Colibri.UI.GetLookupPromise(this, this._lookup, this._input._input.value, (type = null) => {
            return this._getDependsValue(type);
        });
    }

    /**
     * Selector values
     * @type {Array}
     */
    set values(value) {
        let required = this.field?.params?.required;
        if(required === undefined) {
            required = false;
        }
        if(!required) {
            const o = {};
            o[this.field?.selector?.title] = '---';
            o[this.field?.selector?.value] = 0;
            value = isIterable(value) ? [o, ...value] : [o];
        }
        this._input.values = value;
    }

    /**
     * Selector values
     * @type {Array}
     */
    get values() {
        return this._input.values;
    }

    /**
     * Initialize data from lookup when component is created
     * @private
     */
    _initializeValues() {
        if (this.field.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');

            //delay для того чтобы в форму были загружены значения зависимых полей
            Colibri.Common.Delay(this.root ? 100 : 0).then(() => {
                this._setLookup(this.field.lookup).then((response) => {
                    this.values = response.result || response;
                }).finally(() => {
                    this.loading = false;
                    if(this._lastValue) {
                        this.value = this._lastValue;
                        this._lastValue = null;
                    } else {
                        this._input._renderValue(false);
                    }
                    this.RemoveClass('app-select-loading');
                    this._setEnabled();
                });
            });
        } else {
            this._setEnabled();
        }
    }

    /** @private */
    _setEnabled() {
        if(!this.value && this.field.default) {
            this.value = this.field.default;
        }
    }

    /**
     * Shows the component
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }
    /**
     * Shows the component
     * @type {boolean}
     */
    set shown(value) {
        super.shown = value;
        if(this._input) {
            this._input.shown = value;
        }
    }

    /**
     * Focus on editor
     */
    Focus() {
        this._input.Focus();
    }


}
Colibri.UI.Editor.Register('Colibri.UI.SelectEditor', '#{ui-editors-select}');