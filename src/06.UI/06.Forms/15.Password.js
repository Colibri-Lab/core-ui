Colibri.UI.Forms.Password = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-password-field');

        const contentContainer = this.contentContainer;
        const params = {type: 'password', name: (this.form.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input')};
        if(this.form.shuffleFieldNames) {
            params.autocomplete = 'new-password';
        }
        this._input = contentContainer.container.append(Element.create('input', params));

        this.RegisterEvent('PasswordValidated', false, 'Когда сила пароля проверена');
        this.RegisterEvent('PasswordGenerated', false, 'Когда пароль сгенерирован');

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
            this._showPasswordTip(strength);
            this.Dispatch('PasswordValidated', {strength: strength});
        });


    }

    _showPasswordTip(strength) {
        

        if(this._fieldData?.params?.tip) {
            const tipData = this._fieldData?.params?.tip;
            if(!this._passwordTip) {
                this._passwordTip = new Colibri.UI.ToolTip(this.name + '_tip', this.container.closest('[data-object-name="' + tipData.parent + '"]').tag('component').Children(tipData.parent + '-content'), [Colibri.UI.ToolTip.RT, Colibri.UI.ToolTip.RB]);
            }

            let cls = '';
            if (strength > 80) {
                cls = "strong";
            }
            else if (strength > 60) {
                cls = "good";
            }
            else if (strength >= 30) {
                cls = "weak";
            }
            const requirements = this._fieldData?.params?.requirements || {digits: 8, strength: 40};
            let tipText = '<p>' + tipData.text + '</p>' + 
                '<ul><li>' + requirements.digits.formatSequence(tipData.digits, true) + '</li>' + tipData.additional.map(f => '<li>' + f + '</li>').join('') + '</ul>' + 
                '<div class="password-progress ' + cls + '"><span style="width: ' + strength + '%"></span></div>' +  
                '<p>' + (strength < requirements.strength ? tipData.error : tipData.success) + '</p>' + 
                '<a href="#">' + tipData.generate + '</a>';
            this._passwordTip.Show(tipText);

            this._passwordTip.container.querySelector('a').addEventListener('click', (e) => this._generatePassword());
        }
    }

    _generatePassword() {
        const tipData = this._fieldData?.params?.tip;
        this.value = String.Password(16);
        this.value.copyToClipboard().then(() => {
            App.Notices.Add(new Colibri.UI.Notice(tipData.copied, Colibri.UI.Notice.Success));
        });
        this.Dispatch('PasswordValidated', {value: this.value});
    }

    CalcPasswordStrength() {
        const pass = this.value;
        const requirements = this._fieldData?.params?.requirements || {digits: 8, strength: 40};

        if (!pass || pass.length < requirements.digits) {
            return 0;
        }

        let score = 0;
        // award every unique letter until 5 repetitions
        let letters = {};
        for (let i=0; i<pass.length; i++) {
            letters[pass[i]] = (letters[pass[i]] || 0) + 1;
            score += 5.0 / letters[pass[i]];
        }

        // bonus points for mixing it up
        let variations = {
            digits: /\d/.test(pass),
            lower: /[a-z]/.test(pass),
            upper: /[A-Z]/.test(pass),
            nonWords: /\W/.test(pass),
        }

        let variationCount = 0;
        for (let check in variations) {
            variationCount += (variations[check] == true) ? 1 : 0;
        }
        score += (variationCount - 1) * 10;

        if(score > 100) {
            score = 100;
        }

        score = parseInt(score);

        return score;

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

    Dispose() {
        if(this._passwordTip) {
            this._passwordTip.Dispose();
            this._passwordTip = null;
        }
        super.Dispose();
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Password', 'Colibri.UI.Forms.Password', '#{app-fields-password;Пароль}')
