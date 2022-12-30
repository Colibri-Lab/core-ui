Colibri.UI.Forms.MonthYear = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-monthyear-field');

        const contentContainer = this.contentContainer;
        this._month = new Colibri.UI.MonthSelector('month', contentContainer);
        this._year = new Colibri.UI.YearSelector('year', contentContainer, 2000, Date.Now().getFullYear());
        this._month.shown = true;
        this._year.shown = true;

        this._month.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args, {component: this})));
        this._month.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp'));
        this._month.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown'));

        this._year.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args, {component: this})));
        this._year.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp'));
        this._year.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown'));

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
        this._month.Focus()
    }

    get value() {
        return this._year.value.value + '-' + this._month.value.value;
    }

    getValueTitle() {
        return this._month.value.title + ' ' + this._year.value.title;
    }

    set value(value) {

        const parts = value.split('-');

        this._month.value = parts[0];
        this._year.value = parts[1];
    }

    get readonly() {
        return this._month.readonly;
    }

    set readonly(value) {
        this._month.readonly = value;
        this._year.readonly = value;
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._month && this._month.tabIndex;
    }
    set tabIndex(value) {
        if (this._month) {
            this._month.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('MonthYear', 'Colibri.UI.Forms.MonthYear', '#{ui-fields-monthyear}')
