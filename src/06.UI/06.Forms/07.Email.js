Colibri.UI.Forms.Email = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-email-field');

        const contentContainer = this.contentContainer;

        this._validationText = '#{ui-email-validation-message}';

        const params = {type: 'number', name: (this.form && this.form.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input')};
        if(this.form && this.form.shuffleFieldNames) {
            params.autocomplete = 'off';
        }
        this._input = contentContainer.container.append(Element.create('input', params));
        this._input.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', {domEvent: e}));
        this._input.addEventListener('change', (e) => this._isChanged(true) && this.Dispatch('Changed', {domEvent: e, component: this}));
        this._input.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input.addEventListener('keydown', (e) => this._setChanged(true) && this.Dispatch('KeyDown', {domEvent: e}));
        this._input.addEventListener('click', (e) => {
            this.Focus();
            this.Dispatch('Clicked', {domEvent: e})
            e.stopPropagation();
            return false;
        });
        this._input.addEventListener('paste', (e) => {
            Colibri.Common.Delay(100).then(() => {
                this._input.emitHtmlEvents('change');
                this._setChanged(false);
                this.Dispatch('Pasted', { domEvent: e });
            });
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

    _setChanged(value) {
        this._changed = value;
        return true;
    }

    _isChanged() {
        return this._changed;
    }

    _registerEvents() {
        super._registerEvents();
        // ???????? ?????????? ???????????????? ?????? ????
    }

    Focus() {
        this._input.focus();
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
        this._input.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(this._fieldData?.params?.eval) {
            value = eval(this._fieldData?.params?.eval);
        }        
        return value;
    }

    set value(value) {
        this._input.value = value ?? '';
    }

    get validationText() {
        return this._validationText;
    }

    set validationText(value) {
        this._validationText = value;
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
     * ???????????? ??????????????????
     * @todo ?????????????????? ?????????????????? ???? ?????????????? tabIndex ?? ??????????????????
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Email', 'Colibri.UI.Forms.Email', '#{ui-fields-email}')