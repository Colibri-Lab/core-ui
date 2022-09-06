Colibri.UI.Forms.Number = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        
        this.AddClass('app-component-number-field');

        const contentContainer = this.contentContainer;

        const params = {type: 'number', name: (this.form.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input')};
        if(this.form.shuffleFieldNames) {
            params.autocomplete = 'off';
        }
        this._input = contentContainer.container.append(Element.create('input', params));

        this._input.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', {domEvent: e}));
        this._input.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', {domEvent: e}));
        this._input.addEventListener('change', (e) => this.Dispatch('Changed', {domEvent: e}));
        this._input.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input.addEventListener('click', (e) => {
            this.Focus();
            this.Dispatch('Clicked', {domEvent: e})
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

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        this._input.focus();
        this._input.select();
    }

    get readonly() {
        return this._input.attr('readonly') === 'readonly';
    }

    set readonly(value) {
        if(value === true || value === 'true') {
            this._input.attr('readonly', 'readonly');
        }
        else {
            this._input.attr('readonly', null);
        }
    }

    get placeholder() {
        return this._input.attr('placeholder');
    }

    set placeholder(value) {
        this._input.attr('placeholder', value);
    }

    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && value === '') {
            value = null;
        }
        return value;
    }

    set value(value) {
        this._input.value = value ?? '';
    }

    
    get enabled() {
        return this._input.attr('disabled') != 'disabled';
    }

    set enabled(value) {
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
Colibri.UI.Forms.Field.RegisterFieldComponent('Number', 'Colibri.UI.Forms.Number', '#{app-fields-number;Число}')