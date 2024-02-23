Colibri.UI.Forms.Radio = class extends Colibri.UI.Forms.Field {

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


    Focus() {
        this._element.querySelector('input').focus();   
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._showValue();
        this.Validate();
    }

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

        });



    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Radio', 'Colibri.UI.Forms.Radio', '#{ui-fields-radio}')
