Colibri.UI.Forms.Radio = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-radio-field');

        this._validated = false;
        const contentContainer = this.contentContainer;
        
        const ident = Date.Mc();

        const values = this._fieldData.values;
        Object.values(values).forEach((value) => {
            contentContainer.container.append(Element.fromHtml('<label><input type="radio" name="' + this.name + '" id="' + ident + '" value="' + value.value + '" /><span>' + value.title + '</span></label>'))
        });

        contentContainer.container.querySelectorAll('input').forEach(input => input.addEventListener('click', e => {
            this._value = e.target.value;
            this.Dispatch('Changed');
        }));

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
        if(this._fieldData?.selector?.value && this._value instanceof Object) {
            value = this._value[this._fieldData?.selector?.value];
        }

        const input = this._element.querySelector('input[value="' + value + '"]');
        if(input) {
            input.attr('checked', 'checked');
        }

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
