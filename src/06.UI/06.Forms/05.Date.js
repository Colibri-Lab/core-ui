Colibri.UI.Forms.Date = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-date-field');

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
        
    }

    Focus() {
        this._input.Focus();
    }

    get readonly() {
        return this._fieldData.readonly;
    }

    set readonly(value) {
        this._fieldData.readonly = value;
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
        return (value?.toString() === 'Invalid Date' ? null : value.toShortDateString());
    }

    set value(value) {
        if(typeof value == 'string') {
            value = new Date(value);
        }
        this._input.value = value;
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