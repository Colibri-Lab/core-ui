Colibri.UI.Forms.Choose = class extends Colibri.UI.Forms.Field {

    /**
     * Отрисовка содержания компонента поля 
     */
    RenderFieldContainer() {

        this.AddClass('app-component-choose-field');

        const contentContainer = this.contentContainer;

        this._input = this._createSelector();

        this._initializeValues();

        this._input.shown = true;
        this.placeholder = this._fieldData.placeholder;
        if(this._fieldData?.params?.placeholderinfo) {
            this.placeholderinfo = this._fieldData.params.placeholderinfo;
        }

        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this._input.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('Clicked', (event, args) => this.Dispatch('Clicked', args));

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

        if(this._fieldData?.selector.openonnote) {
            this.AddClass('-openonnote');
            this._content.Children(this._name + '-note').AddHandler('Clicked', (event, args) => this.__clickOnNote(event, args));
        }

    }

    __clickOnNote(event, args) {
        this._input.ShowChooser();
    }

    /**
     * Поставить фокус
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Только для чтения
     */
    get readonly() {
        return this._input.readonly;
    }
    set readonly(value) {
        this._input.readonly = value;
    }

    /**
     * Замещающий текст
     */
    get placeholder() {
        return this._input.placeholder;
    }
    set placeholder(value) {
        this._input.placeholder = value;//this._input._placeholder placeholder по умолчанию
    }

    get placeholderinfo() {
        return this._input.placeholderinfo;
    }
    set placeholderinfo(value) {
        this._input.placeholderinfo = value;
    }

    get placeholderempty() {
        return this._input.placeholderempty;
    }
    set placeholderempty(value) {
        this._input.placeholderempty = value;
    }

    /**
     * Выбранное значение
     */
    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(Array.isArray(value)) {
            value = value.map((v) => v[this._fieldData.selector?.value ?? 'value'] ?? v);
        }
        else if(value instanceof Object) {
            value = value[this._fieldData.selector?.value ?? 'value'] ?? value;
        }
        return value;
    }
    set value(value) {
        this._input.value = value;
    }

    /**
     * Включен/выключен
     */
    get enabled() {
        return this._input.enabled;
    }
    set enabled(value) {
        this._input.enabled = value;
    }

    _setEnabled() {
        if(!this.value && this._fieldData.default) {
            this.value = this._fieldData.default;
        }
    }

    /**
     * Если необходимо инициализировать данные из lookup
     * @private
     */
    _initializeValues() {
        if (this._fieldData.lookup) {
            this.loading = true;
            this.AddClass('app-select-loading');

            //delay для того чтобы в форму были загружены значения зависимых полей
            Colibri.Common.Delay(this.root ? 100 : 0).then(() => {
                this._setLookup(this._fieldData.lookup).then((response) => {
                    this.values = response.result || response;
                }).finally(() => {
                    this.loading = false;
                    if(this._lastValue) {
                        this.value = this._lastValue;
                        this._lastValue = null;
                    } else {
                        this._input._renderValue(false);
                    }
                    this.RemoveClass('app-select-loading');
                    this._setEnabled();
                });
            });
        } else {
            this._setEnabled();
        }
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

    set popupconfig(value) {
        this._input.popupconfig = value;
    }

    _createSelector() {
        return new Colibri.UI.Chooser(
            'input',
            this.contentContainer,
            this._fieldData.multiple ?? this._fieldData?.params?.multiple ?? false,
            this._fieldData.readonly,
            this._fieldData.placeholder,
            this._fieldData.selector,
            this._fieldData.default,
            (this._fieldData.allowempty === undefined ? true : this._fieldData.allowempty),
            (this._fieldData.clearicon === undefined ? false : this._fieldData.clearicon)
        );
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Select', 'Colibri.UI.Forms.Select', '#{app-fields-select;Выборка}')
