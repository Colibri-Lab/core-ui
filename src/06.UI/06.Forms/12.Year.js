Colibri.UI.Forms.Year = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-year-field');

        const contentContainer = this.contentContainer;
        this._input = new Colibri.UI.YearSelector('selector', contentContainer, 2000, Date.Now().getFullYear());
        this._input.shown = true;

        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));

    }


    Focus() {
        this._input.Focus();
    }

    get value() {
        return this._input.value.value;
    }

    getValueTitle() {
        return this._input.value.title;
    }

    set value(value) {
        this._input.value = value;
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
            this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}