Colibri.UI.Forms.Password = class extends Colibri.UI.Forms.Field {

    static EyeIconOpen = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.72784 10.616C1.61025 10.4299 1.55146 10.3368 1.51854 10.1932C1.49382 10.0853 1.49382 9.9152 1.51854 9.80734C1.55146 9.66375 1.61025 9.57065 1.72784 9.38445C2.69958 7.84579 5.59205 3.95605 10 3.95605C14.4079 3.95605 17.3004 7.84579 18.2722 9.38445C18.3897 9.57065 18.4485 9.66375 18.4815 9.80734C18.5062 9.9152 18.5062 10.0853 18.4815 10.1932C18.4485 10.3368 18.3897 10.4299 18.2722 10.616C17.3004 12.1547 14.4079 16.0444 10 16.0444C5.59205 16.0444 2.69958 12.1547 1.72784 10.616Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12.5906C11.4306 12.5906 12.5904 11.4309 12.5904 10.0003C12.5904 8.56963 11.4306 7.40988 10 7.40988C8.56938 7.40988 7.40963 8.56963 7.40963 10.0003C7.40963 11.4309 8.56938 12.5906 10 12.5906Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    static EyeIconClose = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.91423 4.03514C9.26514 3.98326 9.62715 3.95543 10 3.95543C14.4079 3.95543 17.3004 7.84515 18.2721 9.38382C18.3898 9.57005 18.4486 9.66316 18.4815 9.80678C18.5062 9.91464 18.5062 10.0848 18.4814 10.1927C18.4485 10.3363 18.3893 10.43 18.2708 10.6175C18.0119 11.0273 17.6172 11.6031 17.0942 12.2277M5.44433 5.43628C3.57747 6.70268 2.31009 8.46212 1.72869 9.38249C1.61055 9.5695 1.55148 9.66301 1.51855 9.80661C1.49382 9.91447 1.49381 10.0846 1.51853 10.1925C1.55144 10.3361 1.61025 10.4292 1.72785 10.6154C2.69959 12.1541 5.59206 16.0438 10 16.0438C11.7773 16.0438 13.3083 15.4114 14.5663 14.5557M2.2289 2.22852L17.7711 17.7707M8.16833 8.16795C7.69957 8.63671 7.40963 9.2843 7.40963 9.99961C7.40963 11.4302 8.56938 12.59 10 12.59C10.7153 12.59 11.3629 12.3 11.8317 11.8313" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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
        if(this._fieldData?.params?.eyeicon) {
            this.eyeIcon = this._fieldData?.params?.eyeicon;
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
                this._passwordTip = new Colibri.UI.ToolTip(this.name + '_tip', tipData.parent ? this.container.closest('[data-object-name="' + tipData.parent + '"]').tag('component').Children(tipData.parent + '-content') : this.Children(this.name + '-content'), tipData.orientation ? tipData.orientation : [Colibri.UI.ToolTip.RT, Colibri.UI.ToolTip.RB]);
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
            contentContainer.Children(this._name + '-icon').Dispose();
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

    _createEyeIcon() {
        const contentContainer = this.contentContainer;
        if(!this._eyeIcon) {
            this.RemoveClass('-has-eye-icon');
            contentContainer.Children(this._name + '-eyeicon').Dispose();
            return;
        }

        const icon = new Colibri.UI.Icon(this._name + '-eyeicon', contentContainer);
        icon.value = Colibri.UI.Forms.Password.EyeIconOpen;
        icon.shown = true;
        icon.AddHandler('Clicked', (event, args) => {
            if(this._input.attr('type') === 'password') {
                icon.value = Colibri.UI.Forms.Password.EyeIconClose;
                this._input.attr('type', 'text');
            }
            else {
                icon.value = Colibri.UI.Forms.Password.EyeIconOpen;
                this._input.attr('type', 'password');
            } 
        })

        this.AddClass('-has-eye-icon');
    }

    set eyeIcon(value) {
        this._eyeIcon = value;
        this._createEyeIcon();
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
