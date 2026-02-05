/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.List = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-list-field');

        this._validated = false;

        const contentContainer = this.contentContainer;
        this._list = new Colibri.UI.List('list', contentContainer);
        this._group = this._list.AddGroup('group', '');
        this._list.shown = true;
        
        this._list.AddHandler('SelectionChanged', this.__thisBubbleWithComponent, false, this);
        this._list.AddHandler('SelectionChanged', this.__selectionChangedToChanged, false, this);
        this._list.AddHandler('KeyUp', this.__thisBubble, false, this);
        this._list.AddHandler('KeyDown', this.__thisBubble, false, this);

        if(this._fieldData?.params?.rendererComponent) {
            this._list.rendererComponent = this._fieldData.params?.rendererComponent;
        } else {
            this._list.__renderItemContent = (itemData) => {
                return this._fieldData.selector && this._fieldData.selector.title ? itemData[this._fieldData.selector.title] : itemData.title;
            };
        }

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.multiple === undefined) {
            this.multiple = false;    
        }
        else {
            this.multiple = this._fieldData?.params?.multiple;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        this.ReloadValues();


    } 

    __selectionChangedToChanged(event, args) {
        return this.Dispatch('Changed', args);
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
        return Colibri.UI.GetLookupPromise(this, this._lookup, '', (type = null) => {
            return this._getDependsValue(type);
        });
    }

    /**
     * Reload values to component
     */
    ReloadValues() {
        this.loading = true;
        if(this._fieldData?.values) {
            this.values = this._fieldData?.values;
        } else {
            this._setLookup(this._fieldData.lookup).then((response) => {
                this.values = response.result || response;
            }).finally(() => {
                this.loading = false;
                if(this._lastValue) {
                    this.value = this._lastValue;
                    this._lastValue = [];
                } else {
                    this._list.selectedValue = [];
                }
                this.RemoveClass('app-select-loading');
                this.Dispatch('LookupCompleted');
            });
        }

    }

    /**
     * Focus on component
     */
    Focus() {
        this._list.Focus();
    }

    /**
     * Value
     * @type {Object|string}
     */
    get value() {
        try {
            if(this.multiple) {
                return this._list.selectedValue.map(v => v[this._fieldData?.selector?.value ?? 'value']);
            } else {
                return this._list.selectedValue[this._fieldData?.selector?.value ?? 'value'];
            }
        } catch(e) {
            return this.multiple ? [] : null;
        }
    }

    /**
     * Value
     * @type {Object|string}
     */
    set value(value) {
        if(this.loading === true) {
            this._lastValue = value;
        } else {
            if(!this.multiple) {
                this._list.selectedValue = Array.findObject(this.values ?? [], this._fieldData?.selector?.value ?? 'value', value);
            } else {
                this._list.selectedValue = value.map(v => {
                    return Array.findObject(this.values ?? [], this._fieldData?.selector?.value ?? 'value', v);
                });
                
            }
        }
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._list.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        this._list.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
    }

    /**
     * Array of values
     * @type {Array}
     */
    get values() {
        return this._values;
    }
    /**
     * Array of values
     * @type {Array}
     */
    set values(value) {
        this._values = value;
        for(const v of value) {
            this._group.AddItem(v);
        }
    }

    /**
     * Is list multiple
     * @type {Boolean}
     */
    get multiple() {
        return this._list.multiple;
    }
    /**
     * Is list multiple
     * @type {Boolean}
     */
    set multiple(value) {
        this._list.multiple = value;
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('List', 'Colibri.UI.Forms.List', '#{ui-fields-list}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])
