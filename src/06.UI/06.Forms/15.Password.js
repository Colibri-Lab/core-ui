Colibri.UI.Forms.Password = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-password-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('input', {type: 'password', name: this._name + '-input'}));

        this.readonly = this._fieldData.readonly;

        this._input.addEventListener('change', (e) => this.Dispatch('Changed', {domEvent: e}));
        this._input.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input.addEventListener('paste', (e) => Colibri.Common.Delay(100).then(() => this.Dispatch('Pasted', { domEvent: e })));
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', {domEvent: e}));
        this._input.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', {domEvent: e}));
        this._input.addEventListener('click', (e) => {
            this.Focus();
            e.stopPropagation();
            return false;
        });

    }

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        this._input.focus();
    }

    get readonly() {
        return this._fieldData.readonly;
    }

    set readonly(value) {
        this._fieldData.readonly = value === true || value === 'true';
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
        if(this._fieldData?.params?.emptyAsNull && !value) {
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
Colibri.UI.Forms.Field.RegisterFieldComponent('Password', 'Colibri.UI.Forms.Password', 'Пароль')
