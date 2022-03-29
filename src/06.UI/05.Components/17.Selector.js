Colibri.UI.Selector = class extends Colibri.UI.Component {

    _skipLooseFocus;
    _itemSelected;
    /**
     * Конструктор
     * @param {string} name название компонента
     * @param {Element|string|Colibri.UI.Component} container 
     * @param {boolean} multiple мультивыбор 
     * @param {boolean} readonly только для чтения 
     * @param {string[]|null} values значения 
     * @param {string|number|null} defaultValue значение по умолчанию 
     * @param {string} titleField название поля для отображения 
     * @param {string} valueField название поля для значения 
     * @param {Function|null} __render метод отрисовки
     * @param {boolean} allowEmpty разрешено пустое значение
     * @param {boolean} clearIcon показать clearIcon
     */
    constructor(name, container, multiple = false, readonly = true, values = [], defaultValue = null, titleField = 'title', valueField = 'value', __render = null, allowEmpty = true, clearIcon = false) {
        super(name, container, '<div />');

        this.AddClass('app-selector-component');

        this._multiple = multiple;
        this.__render = __render;
        this._titleField = titleField || 'title';
        this._valueField = valueField || 'value';
        this._default = defaultValue;
        this._values = values;
        this._inprooveValues();
        this._value = [];
        this._placeholder = 'Ничего не выбрано';

        this._input =  new Colibri.UI.Input(this._name + '-input', this);
        this._input.shown = true;
        this._input.icon = null;
        this._input.hasIcon = false;
        this._input.hasClearIcon = (clearIcon || !readonly);
        this._input.placeholder = this._placeholder;

        this._arrow = Element.create('span', {class: 'arrow'});
        this._arrow.html(Colibri.UI.SelectArrowIcon);
        this._element.append(this._arrow);

        this.readonly = readonly;
        this.allowempty = allowEmpty;

        this._setValue(this._default);
        this._renderValue();

        this._handleEvents();
    }

    _inprooveValues() {
        let v = [];
        for(let vv of this._values) {
            if(!(vv instanceof Object)) {
                vv = {value: vv, title: vv};
            }
            v.push(vv);
        }
        this._values = v;
    }

    /**
     * Регистрация событий
     */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('Changed', false, 'Когда выбор изменился');
    }

    /**
     * Регистрация обработчиков событий
     */
    _handleEvents() {

        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));

        this._input.AddHandler('Filled', (event, args) => this.__Filled(event, args));
        this._input.AddHandler('Cleared', (event, args) => this.__Cleared(event, args));
        this._input.AddHandler('Clicked', (event, args) => this.__Clicked(event, args));

        this._arrow.addEventListener('click', (e) => { this.enabled && this._showPopup(this._search()); e.stopPropagation(); return false; });

        this._input.AddHandler('LoosedFocus', (event, args) => {
            if(!this._skipLooseFocus) {
                //Colibri.Common.Delay(500).then(() => {
                    this._removePopup();
                    this._input.SendToBack();
                //});
            }
        });
    }

    __Filled(event, args) {
        this._itemSelected = false;
        this.__BeforeFilled().then((ret) => {
            if(ret === false || this._itemSelected === true) {
                return;
            }
            const values = this._search(this._input.value);
            if (this._popup) {
                this._popup.FillItems(values, this._lastValue);
            } else {
                this._showPopup(values);
            }

            if(this.allowempty) {
                this.Dispatch('Changed', args);
            }

            this._renderValue(false);
        });

        args.domEvent?.preventDefault();
        args.domEvent?.stopPropagation();

        return false;
    }

    async __BeforeFilled() {
        return true;
    }

    __Cleared(event, args) {
        const values = this._search(this._input.value);
        this._setValue(null);

        if (this._popup) {
            this._popup.FillItems(values);
        }

        this._lastValue = null;

        this.Dispatch('Changed', args);
        this._renderValue(false);

        args.domEvent?.preventDefault();
        args.domEvent?.stopPropagation();
        return false;
    }

    __Clicked(event, args) {
        this.Focus();
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

    _removePopup() {
        if(this._popup) {
            this._popup.shown = false;
            this._popup.Dispose();
            this._popup = null;
            if(!this.allowempty && (!this._value || !this._value.length) && this._lastValue) {
                this.value = this._lastValue;
            }
        }
    }

    /**
     * Показать выпадащий список
     * @param {array} values массив значений
     */
    _showPopup(values) {

        if(!this._popup) {
            this._popup = this._createPopup(values);
            this._registerPopupEventHandlers(this._popup);
        }

        if(!this._popup.shown) {
            this._popup.Show();
            if(this._popupconfig) {
                Object.assign(this._popup, this._popupconfig);
            }
            this._input.BringToFront();
        }
    }

    /**
     * Выбранное значение
     * @return array|Object|boolean
     */
    get value() {
        if (!this._multiple) {
            return this._value[0] ?? null;
        }
        return this._value;
    }

    /**
     * Установить выбранное значение
     * @param {*} value
     */
    set value(value) {
        this._setValue(value);
        this._renderValue();
    }

    set multiple(value) {
        this._multiple = value === 'true' || value === true;
    }

    get multiple() {
        return this._multiple;
    }


    /**
     * Установить выбранное значение
     * @param {*} value
     */
    _setValue(value) {
        if (value === null || value === false) {
            this._value = [];
            if(this.allowempty) {
                this._lastValue = this._value;
            }
        }
        else if(Array.isArray(value)) {
            if (!this._multiple) {
                this._value = [];
                this._value.push(this._lastValue = value.shift());
            } else {
                this._lastValue = this._value = value;
            }
        }
        else if(value instanceof Object) {
            if (!this._multiple) {
                this._value = [];
            }
            this._lastValue = value;
            this._value.push(value);
        }
        else {
            if (!this._multiple) {
                this._value = [];
            }
            let _found = this._findValue(value);
            if(_found) {
                this._value.push(_found);
                this._lastValue = _found;
            }
        }
    }

    /**
     * Выбрать значение
     * @param {string|number} value значение
     * @returns string
     */
    _findValue(value) {
        let foundValue = null;
        if(value) {
            value = value[this._valueField] ?? value;
        }
        if(this._values) {
            const values = Object.values(this._values);
            for(let vv of values) {
                if(!(vv instanceof Object)) {
                    vv = {value: vv, title: vv}
                }
                if (vv[this._valueField] == value) {
                    foundValue = vv;
                    break;
                }
            }
        }
        return foundValue;
    }

    /**
     * Отобразить значения
     */
    _renderValue(renderValue = true) {
        if (!this.multiple) {
            renderValue && (this._input.value = this._value[0] ? (this._value[0][this._titleField] ?? this._value[0]) : this._value);

            if(!this._placeholderempty || this.HaveValues()) {
                this._input.placeholder = this.placeholder ?? '';
            } else {
                this._input.placeholder = this._placeholderempty;
            }
        } else {
            let itemCount = this._value.length;
            this._input._forcedClearIcon = (itemCount !== 0);
            renderValue && (this._input.value = '');

            if(itemCount === 0) {
                this._input.placeholder = this.placeholder ?? '';
            } else if(this._placeholderinfo) {
                this._input.placeholder = String.Pluralize(this._placeholderinfo, itemCount);
            } else {
                this._input.placeholder = `Выбрано ${itemCount} ${this.parent.parent.title || ""}`;
            }
        }
    }

    /**
     * Поставить фокус
     */
    Focus() {
        this._input.Focus();
        if(this.enabled) {
            this._showPopup(this._search());
        }
    }

    HaveValues() {
        const values = this.values;
        return !!(values && Object.values(values).length);
    }

    /**
     * Свойство только для чтения
     */
    get readonly() {
        return !!this._input.readonly;
    }
    set readonly(value) {
        if(value === true || value === 'true') {
            this.AddClass('app-component-readonly');
            this._input.readonly = true;
        }
        else {
            this.RemoveClass('app-component-readonly');
            this._input.readonly = false;
        }
    }

    /**
     * Текст для отображения вместо значения
     */
    get placeholder() {
        return this._placeholder;
    }
    set placeholder(value) {
        this._placeholder = value;
        this._input.placeholder = this._placeholder;
        this._renderValue(false);
    }

    get placeholderinfo() {
        return this._placeholderinfo;
    }
    set placeholderinfo(value) {
        this._placeholderinfo = value;
        this._renderValue(false);
    }

    get placeholderempty() {
        return this._placeholderempty;
    }
    set placeholderempty(value) {
        this._placeholderempty = value;
    }

    /**
     * Вкючено/выключено
     */
    get enabled() {
        return this._input.enabled;
    }
    set enabled(value) {
        if(value) {
            this.RemoveClass('app-component-disabled');
        }
        else {
            this.AddClass('app-component-disabled');
        }
        this._input.enabled = value;
    }

    /**
     * Список значений
     */
    get values() {
        return this._values;
    }
    set values(value) {
        this._values = value;
    }

    /**
     * Найти значения для отображения в селекторе
     * @param {string} searchString строка поиска
     * @return {array} массив подходящих значений
     *  */
    _search(searchString) {
        if (!searchString) {
            return this._values ?? {};
        }

        let searchPattern = new RegExp(String.EscapeRegExp(searchString), 'i');
        let values = this._values;
        let matches = [];
        let startMatches = [];

        Array.isArray(values) && values.forEach((value) => {
            let stringPosition = value[this._titleField].search(searchPattern);
            if (stringPosition !== -1) {
                stringPosition === 0 ? startMatches.push(value) : matches.push(value);
            }
        });

        // элементы, которые начинаются со строки поиска, переносятся в начало списка
        return startMatches.concat(matches);
    }

    set popupconfig(value) {
        this._popupconfig = value;
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

    _createPopup(values) {
        const popup = new Colibri.UI.PopupList('select-popup', this, this._multiple, this.__render, this._titleField, this._valueField);
        popup.multiple = this._multiple;
        popup.parent = this;

        //заполнение списка перед хэндлерами, чтобы не сработал SelectionChanged
        popup.FillItems(values, this._value);

        return popup;
    }

    _registerPopupEventHandlers(popup) {
        // сначала происходит SelectionChanged потом ItemClicked, странность, но так сделано
        // SelectionChanged появляется внутри списка, и не связан с значением по умолчанию в селекторе
        popup.AddHandler('ItemMouseDown', (event, args) => {
            this._skipLooseFocus = true;
        });
        popup.AddHandler('Clicked', (event, args) => {
            this._skipLooseFocus = false;
            this._itemSelected = true;
            args?.domEvent.stopPropagation();
            args?.domEvent.preventDefault();

            let selected;
            if (!this._multiple) {
                selected = popup.selected?.value ?? [];
                popup.Dispatch('ShadowClicked');
            } else {
                selected = popup.selected?.map((item) => { return item.value; }) ?? [];
            }

            if(!Array.isArray(selected)) {
                selected = [selected];
            }

            if(JSON.stringify(selected) === JSON.stringify(this._value)) {
                return;
            }

            this._setValue(selected);
            this._renderValue(!this._multiple);
            if(!this.readonly) {
                this._input._input.focus();//возвращаем фокус на инпут
            }
            this.Dispatch('Changed', args);
            return false;
        });

        popup.AddHandler('ShadowClicked', () => {
            this._removePopup();
            this._renderValue();
            this._input.SendToBack();
        });
    }
}

