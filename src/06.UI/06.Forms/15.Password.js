Colibri.UI.Forms.Password = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-password-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('input', {type: 'password', name: this._name + '-input'}));

        this.RegisterEvent('PasswordValidated', false, 'Когда сила пароля проверена');

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

        if(this._fieldData?.params?.icon) {
            this.icon = this._fieldData?.params?.icon;
        }

        this.AddHandler(['Changed', 'KeyUp', 'Paste'], (event, args) => {
            const strength = this.CalcPasswordStrength();
            this.Dispatch('PasswordValidated', {strength: strength});
        });


    }

    CalcPasswordStrength() {
        const password = this.value;

        if (password.length < 8) {
            return 0;
        }

        // count how many lowercase, uppercase, and digits are in the password 
        let uc = 0, lc = 0, num = 0, other = 0, j = 0, i = 0;
        for (i = 0, j = password.length; i < j; i++) {
            const c = password.substr(i, 1);
            if (/^[A-Z]/.test(c)) {
                uc++;
            } else if (/^[a-z]/.test(c)) {
                lc++;
            } else if (/^[0-9]/.test(c)) {
                num++;
            } else {
                other++;
            }
        }
    
        let max = j - 2;

        uc = uc * 100 / max;
        lc = lc * 100 / max;
        num = num * 100 / max;
        other = other * 100 / max;

        let percents = [uc, lc, num, other];
        for(const p of percents) {
            if(p === 0) {
                return 0;
            }
        }
        
        return percents.reduce((a, b) => a + b, 0) / percents.length;

    }

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
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

    _showIcon() {
        const contentContainer = this.contentContainer;
        if(!this._icon) {
            this.RemoveClass('-has-icon');
            contentContainer.Children('icon').Dispose();
            return;
        }

        const icon = new Colibri.UI.Icon(this._name + '-icon', contentContainer);
        icon.value = this._icon;
        icon.shown = true;

        this.AddClass('-has-icon');

    }

    set icon(value) {
        this._icon = value;
        this._showIcon();
    }
    get icon() {
        return this._icon;
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Password', 'Colibri.UI.Forms.Password', '#{app-fields-password;Пароль}')
