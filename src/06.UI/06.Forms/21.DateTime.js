Colibri.UI.Forms.DateTime = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-datetime-field');


        const contentContainer = this.contentContainer;

        this._input = new Colibri.UI.DateSelector(this._name + '-input', contentContainer);
        this._input.shown = true;
        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('Clicked', (event, args) => {
            this.Focus();
            this.Dispatch('Clicked', args);
            args.domEvent.stopPropagation();
            return false;
        });

        this._time = new Colibri.UI.Input(this._name + '-time', contentContainer);
        this._time.shown = true;
        this._time.hasIcon = false;
        this._time.hasClearIcon = false;
        this._time.mask = '99:99:99';

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
        this._input.Focus();
    }

    get readonly() {
        return this._input.readonly;
    }

    set readonly(value) {
        this._input.readonly = value;
    }

    get placeholder() {
        return this._input.placeholder;
    }

    set placeholder(value) {
        this._input.placeholder = value;
    }

    get value() {
        let value = this._input.value;
        let timeValue = this._time.value;
        
        value = (value?.toString() === 'Invalid Date' ? null : value.toShortDateString());
        return value + ' ' + timeValue;
    }

    set value(value) {
        if(typeof value == 'string') {
            value = new Date(value);
        }
        this._input.value = value;
        this._time.value = value.toTimeString();
    }

    
    get enabled() {
        return this._input.enabled;
    }

    set enabled(value) {
        this._input.enabled = value;
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Date', 'Colibri.UI.Forms.Date', '#{app-fields-datetime;Поле дата и время}');