/**
 * @class
 * @memberof Colibri.UI.Forms
 * @extends Colibri.UI.Forms.Field
 */
Colibri.UI.Forms.Radio = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-radio-field');

        this._validated = false;
        
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

        this._loadValues();

    }

    /**
     * Focus on component
     */
    Focus() {
        if(this._element.querySelector('input')) {
            this._element.querySelector('input').focus();
        } else {
            this._focusOnFirst = true;
        }
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return this._value;
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        this._value = value;
        this._showValue();
        this.Validate();
    }

    /** @private */
    _showValue() {

        let value = this._value;
        if(this._fieldData?.selector?.value && Object.isObject(this._value)) {
            value = this._value[this._fieldData?.selector?.value];
        }

        const input = this._element.querySelector('input[value="' + value + '"]');
        if(input) {
            input.attr('checked', 'checked');
        }

    }

    /**
     * Array of values
     * @type {Array}
     */
    get values() {
        return this._fieldData.values;
    }
    /**
     * Array of values
     * @type {Array}
     */
    set values(value) {
        value = this._convertProperty('Array', value);
        this._fieldData.values = value;
        this._loadValues();
    }

    /** @private */
    _loadValues() {
        const contentContainer = this.contentContainer;
        const ident = Date.Mc();

        let promise = null;
        let values = this._fieldData.values;
        if(values instanceof Function) {
            promise = values(this._fieldData, this);
        } else {
            promise = Promise.resolve(values);
        }

        promise.then((values) => {
            contentContainer.container.html('');
            let selectedValue = null;
            Object.values(values).forEach((value) => {
                if(value?.__selected) {
                    selectedValue = value.value;
                }
                contentContainer.container.append(Element.fromHtml('<label><input type="radio" name="' + this.name + '" id="' + ident + '" value="' + value.value + '"' + (value?.__selected ? ' checked="checked"' : '') + ' /><span>' + (value.title[Lang.Current] ?? value.title) + '</span></label>'))
            });
    
            contentContainer.container.querySelectorAll('input').forEach(input => input.addEventListener('click', e => {
                this._value = e.target.value;
                this.Dispatch('Changed', {domEvent: e, component: this});
            }));

            if(selectedValue) {
                this._value = selectedValue;
            }
            
            this._showValue();

            if(this._focusOnFirst) {
                this.Focus();
            }

        });



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
    
}

Colibri.UI.Forms.Field.RegisterFieldComponent('Radio', 'Colibri.UI.Forms.Radio', '#{ui-fields-radio}')
