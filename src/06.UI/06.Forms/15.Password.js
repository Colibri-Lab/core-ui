/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Password = class extends Colibri.UI.Forms.Field {

    /** Eye Icon Opened */
    static EyeIconOpen = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.72784 10.616C1.61025 10.4299 1.55146 10.3368 1.51854 10.1932C1.49382 10.0853 1.49382 9.9152 1.51854 9.80734C1.55146 9.66375 1.61025 9.57065 1.72784 9.38445C2.69958 7.84579 5.59205 3.95605 10 3.95605C14.4079 3.95605 17.3004 7.84579 18.2722 9.38445C18.3897 9.57065 18.4485 9.66375 18.4815 9.80734C18.5062 9.9152 18.5062 10.0853 18.4815 10.1932C18.4485 10.3368 18.3897 10.4299 18.2722 10.616C17.3004 12.1547 14.4079 16.0444 10 16.0444C5.59205 16.0444 2.69958 12.1547 1.72784 10.616Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12.5906C11.4306 12.5906 12.5904 11.4309 12.5904 10.0003C12.5904 8.56963 11.4306 7.40988 10 7.40988C8.56938 7.40988 7.40963 8.56963 7.40963 10.0003C7.40963 11.4309 8.56938 12.5906 10 12.5906Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    /** Eye Icon Closed */
    static EyeIconClose = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.91423 4.03514C9.26514 3.98326 9.62715 3.95543 10 3.95543C14.4079 3.95543 17.3004 7.84515 18.2721 9.38382C18.3898 9.57005 18.4486 9.66316 18.4815 9.80678C18.5062 9.91464 18.5062 10.0848 18.4814 10.1927C18.4485 10.3363 18.3893 10.43 18.2708 10.6175C18.0119 11.0273 17.6172 11.6031 17.0942 12.2277M5.44433 5.43628C3.57747 6.70268 2.31009 8.46212 1.72869 9.38249C1.61055 9.5695 1.55148 9.66301 1.51855 9.80661C1.49382 9.91447 1.49381 10.0846 1.51853 10.1925C1.55144 10.3361 1.61025 10.4292 1.72785 10.6154C2.69959 12.1541 5.59206 16.0438 10 16.0438C11.7773 16.0438 13.3083 15.4114 14.5663 14.5557M2.2289 2.22852L17.7711 17.7707M8.16833 8.16795C7.69957 8.63671 7.40963 9.2843 7.40963 9.99961C7.40963 11.4302 8.56938 12.59 10 12.59C10.7153 12.59 11.3629 12.3 11.8317 11.8313" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-password-field');
        this._original = null;

        const contentContainer = this.contentContainer;
        const params = {type: 'password', name: (this.form && this.form.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input')};
        if(this.form && this.form.shuffleFieldNames) {
            params.autocomplete = 'new-password';
        }
        this._input = contentContainer.container.append(Element.create('input', params));

        this.RegisterEvent('PasswordValidated', false, 'Когда сила пароля проверена');
        this.RegisterEvent('PasswordGenerated', false, 'Когда пароль сгенерирован');

        this._input.addEventListener('change', (e) => {
            if(this._original != this._input.value) {
                this.Dispatch('Changed', {domEvent: e, component: this});
            }
            this._original = this._input.value;
        });
        this._input.addEventListener('keyup', (e) => {
            this.Dispatch('KeyUp', {domEvent: e});
            if( (this._fieldData?.params?.changeOnKeyPress ?? false) ) {
                if(this._keyUpChangeTimer !== -1) {
                    clearTimeout(this._keyUpChangeTimer);
                }
                this._keyUpChangeTimer = setTimeout(() => {
                    this._input.emitHtmlEvents('change');
                }, 500);
            }
        });
        const onInputPasted = (e) => Colibri.Common.Delay(100).then(() => {
            this._input.emitHtmlEvents('change');
            this._original = this._input.value;
            this.Dispatch('Pasted', { domEvent: e });
            this.Dispatch('Changed', {domEvent: e, component: this});
        });
        this._input.addEventListener('paste', onInputPasted);
        this._input.addEventListener('input', onInputPasted);
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

        this.AddHandler(['KeyUp', 'Pasted', 'ReceiveFocus'], (event, args) => {
            const strength = this.CalcPasswordStrength();
            this._showPasswordTip(strength);
            this.Dispatch('PasswordValidated', {strength: strength});
        });


    }

    /** @private */
    _hidePasswordTip() {
        if(this._passwordTip) {
            Colibri.Common.Delay(2000).then(() => {
                this._passwordTip.Hide();
            })
        }
    }

    /** @private */
    _showPasswordTip(strength) {
        
        if(this._fieldData?.params?.tip) {
            const tipData = this._fieldData?.params?.tip;
            if(!this._passwordTip) {
                this._passwordTip = new Colibri.UI.ToolTip(
                    this.name + '_tip', document.body, 
                    tipData.orientation ? tipData.orientation : [Colibri.UI.ToolTip.RB, Colibri.UI.ToolTip.LB]
                );
            }


            if(tipData.className) {
                this._passwordTip.AddClass(tipData.className);
            }

            const requirements = this._fieldData?.params?.requirements || {digits: 8, strength: 40};

            let cls = 'bad';
            if (strength > requirements?.minForStrong ?? 80) {
                cls = "strong";
            }
            else if (strength > requirements?.minForGood ?? 60) {
                cls = "good";
            }
            else if (strength >= requirements?.minForWeak ?? 30) {
                cls = "weak";
            }
            let tipText = '';
            if(typeof tipData.text === 'function') {
                const f = tipData.text;
                tipText = f(strength, tipData, requirements);
            } else {
                tipText = '<p>' + (Array.isArray(tipData.text) ? tipData.text.join('</p><p>') : tipData.text) + '</p>' + 
                    '<ul><li>' + (Array.isArray(tipData.digits) ? requirements.digits.formatSequence(tipData.digits, true) : tipData.digits.replaceAll('%s', requirements.digits)) + '</li>' + tipData.additional.map(f => '<li>' + f + '</li>').join('') + '</ul>' + 
                    '<div class="password-progress ' + cls + '"><span style="width: ' + strength + '%"></span></div>' +  
                    '<p>' + (strength < requirements.strength ? tipData.error : tipData.success) + '</p>' + 
                    '<a href="#">' + tipData.generate + '</a>';
            }
            
            this._passwordTip.value = tipText;
            const a = this._passwordTip.container.querySelector('a');
            if(a) {
                a.addEventListener('click', (e) => this._generatePassword(e));
            }

            if(cls === 'strong') {
                this._hidePasswordTip();
            } else if(this.value.length > 0 && this.elementIsInOffset) {
                this._passwordTip.Show(this.contentContainer, true);
            }     
            
        }
    }

    /** @private */
    _generatePassword(e) {
        const tipData = this._fieldData?.params?.tip;
        this.value = String.Password(16);
        const strength = this.CalcPasswordStrength();
        this._showPasswordTip(strength);
        this.value.copyToClipboard().then(() => {
            App.Notices.Add(new Colibri.UI.Notice(tipData.copied, Colibri.UI.Notice.Success));
        });
        this.Dispatch('Changed', {component: this});
        this.Dispatch('PasswordValidated', {value: this.value});
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    /**
     * Calculates password strength
     * @returns {number}
     */
    CalcPasswordStrength() {
        const pass = this.value;

        if(this._fieldData?.params?.strengthMethod) {
            const f = this._fieldData?.params?.strengthMethod;
            return f(pass);
        }

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

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    /**
     * Focus on component
     */
    Focus() {
        this._input.focus();
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.attr('readonly') === 'readonly';
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this._input.attr('readonly', 'readonly');
        }
        else {
            this._input.attr('readonly', null);
        }
    }

    /**
     * Placeholder text
     * @type {string}
     */
    get placeholder() {
        return this._input.attr('placeholder');
    }

    /**
     * Placeholder text
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.attr('placeholder', value);
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        return value;
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        this._original = value;
        this._input.value = value ?? '';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */ 
    get enabled() {
        return this._input.attr('disabled') != 'disabled';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */ 
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
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

    /** @private */
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

    /**
     * Icon
     * @type {string}
     */
    set icon(value) {
        value = this._convertProperty('String', value);
        this._icon = value;
        this._showIcon();
    }
    /**
     * Icon
     * @type {string}
     */
    get icon() {
        return this._icon;
    }

    /** @private */
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

    /**
     * Eye Icon
     * @type {string}
     */
    get eyeIcon() {
        return this._eyeIcon;
    }

    /**
     * Eye Icon
     * @type {string}
     */
    set eyeIcon(value) {
        value = this._convertProperty('String', value);
        this._eyeIcon = value;
        this._createEyeIcon();
    }

    /**
     * Dispose component
     */
    Dispose() {
        if(this._passwordTip) {
            this._passwordTip.Dispose();
            this._passwordTip = null;
        }
        super.Dispose();
    }

    /**
     * 
     * @type {Colibri.UI.ToolTip}
     */
    get passwordTip() {
        return this._passwordTip;
    }

}

Colibri.UI.Forms.Field.RegisterFieldComponent('Password', 'Colibri.UI.Forms.Password', '#{ui-fields-password}')
