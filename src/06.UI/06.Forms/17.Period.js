Colibri.UI.Forms.Period = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-period-field');

        const contentContainer = this.contentContainer;

        this._input1 = new Colibri.UI.DateSelector(this._name + '-input1', contentContainer);
        this._input1.shown = true;
        this._input1.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this._input1.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));

        this._input2 = new Colibri.UI.DateSelector(this._name + '-input2', contentContainer);
        this._input2.shown = true;
        this._input2.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this._input2.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));

        this._text = new Colibri.UI.TextSpan(this._name + '-text', contentContainer);
        this._text.shown = true;

        this.AddHandler('Changed', (event, args) => {
            if(this._input1.value != 'Invalid Date' && this._input2.value != 'Invalid Date') {
                const days = parseInt((this._input2.value.getTime() - this._input1.value.getTime()) / 1000 / 86400) + 1;
                this._text.value = days.formatSequence(['#{app-period-day1;день}', '#{app-period-day2;дня}', '#{app-period-day3;дней}'], true);
            }
            else {
                this._text.value = '';
            }
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

    Focus() {
        this._input1.Focus();
    }

    get readonly() {
        return this._input1.readonly;
    }

    set readonly(value) {
        this._input1.readonly = value;
    }

    get placeholder() {
        return this._input.placeholder;
    }

    set placeholder(value) {
        this._input1.placeholder = value;
    }

    get value() {
        let input1 = this._input1.value != 'Invalid Date' ? this._input1.value.toShortDateString() : this._input1.value;
        let input2 = this._input2.value != 'Invalid Date' ? this._input2.value.toShortDateString() : this._input2.value;
        return [input1, input2];
    }

    set value(value) {
        this._input1.value = value ? value[0] : null;
        this._input2.value = value ? value[1] : null;
    }


    get enabled() {
        return this._input1.enabled;
    }

    set enabled(value) {
        this._input1.enabled = value;
        this._input2.enabled = value;
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._input1 && this._input1.tabIndex;
    }
    set tabIndex(value) {
        if (this._input1) {
            this._input1.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Period', 'Colibri.UI.Forms.Period', '#{app-fields-period;Период}')
