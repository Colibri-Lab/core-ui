Colibri.UI.Forms.Checkbox = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-checkbox-field');

        const contentContainer = this.contentContainer;

        this._input = new Colibri.UI.Checkbox(this._name + '-input', contentContainer);
        this._input.shown = true;

        this._label = new Colibri.UI.TextSpan(this._name + '-label', contentContainer);
        this._label.shown = true;
        this._label.AddClass('app-component-checkbox-label');
        this._label.value = this._fieldData.placeholder;

        this._handleEvents();
    }

    _handleEvents() {
        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this._input.AddHandler('Clicked', (event, args) => {
            this.Dispatch('Clicked', args)
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });

        this._label.AddHandler('Clicked', (event, args) => {
            this._input.Dispatch('Clicked', args);
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

    get value() {
        return this._input.checked;
    }

    set value(value) {
        this._input.checked = !!value;
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
            this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}