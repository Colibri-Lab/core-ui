Colibri.UI.Selector = class extends Colibri.UI.Component {

    _skipLooseFocus;
    _itemSelected;

    /**
     * Конструктор
     * @param {string} name название компонента
     * @param {Element|string|Colibri.UI.Component} container 
     * @param {boolean} multiple мультивыбор 
     * @param {boolean} readonly только для чтения 
     * @param {boolean} searchable can search in items 
     * @param {string[]|null} values значения 
     * @param {string|number|null} defaultValue значение по умолчанию 
     * @param {string} titleField название поля для отображения 
     * @param {string} valueField название поля для значения 
     * @param {Function|null} __render метод отрисовки
     * @param {boolean} allowEmpty разрешено пустое значение
     * @param {boolean} clearIcon показать clearIcon
     */
    constructor(name, container, multiple = false, readonly = true, searchable = true, values = [], defaultValue = null, titleField = 'title', valueField = 'value', groupField = null, __render = null, allowEmpty = true, clearIcon = false, canSelectGroup = false) {
        super(name, container, Element.create('div'));

        this.AddClass('app-selector-component');

        this._multiple = multiple;
        this.__render = __render;
        this._titleField = titleField || 'title';
        this._valueField = valueField || 'value';
        this._groupField = groupField || null;
        this._default = defaultValue;
        this._values = values;
        this._inprooveValues();
        this._value = [];
        this._placeholder = '#{ui-selector-nothingchoosed}';

        this._input =  new Colibri.UI.Input(this._name + '-input', this);
        this._input.shown = true;
        this._input.icon = null;
        this._input.hasIcon = false;
        this._input.hasClearIcon = clearIcon;
        this._input.placeholder = this._placeholder;
        this._input.toolTip = '';

        this._arrow = Element.create('span', {class: 'arrow'});
        this._arrow.html(Colibri.UI.SelectArrowIcon);
        this._element.append(this._arrow);

        this.readonly = readonly;
        this.searchable = searchable;
        this.allowempty = allowEmpty;
        this.canSelectGroup = canSelectGroup;

        this._setValue(this._default);
        this._renderValue();

        this._handleEvents();
    }

    _inprooveValues() {
        let v = [];
        for(let vv of this._values) {
            if(!Object.isObject(vv)) {
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

    __preventScrolling(e) {
        e.preventDefault();
    }
    
    _changeBodyScroll() {

        let wnd = this._element.closest('.app-component-window');
        wnd = wnd ?? document.body;
        const scrolling = new Colibri.Common.Scrolling(wnd);
        if (this._popup && this._popup.shown) {
            scrolling.Disable();
        } else {
            scrolling.Enable();
        }
    }

    /**
     * Регистрация обработчиков событий
     */
    _handleEvents() {

        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));

        this._input.AddHandler('Filled', (event, args) => this.__Filled(event, Object.assign(args, {search: true})));
        this._input.AddHandler('Cleared', (event, args) => this.__Cleared(event, args));
        this._input.AddHandler('Clicked', (event, args) => this.__Clicked(event, args));
        this._input.AddHandler('ReceiveFocus', (event, args) => this.Dispatch('ReceiveFocus', args));
        this._input.AddHandler('LoosedFocus', (event, args) => !this._skipLooseFocus && this.Dispatch('LoosedFocus', args));


        this._arrow.addEventListener('click', (e) => { 
            this.Focus();
            if(this.enabled) {
                this.__Filled(null, {search: false});
            }
            return false; 
        });

        this._input.AddHandler('LoosedFocus', (event, args) => {
            if(!this._skipLooseFocus) {
                this._hidePopup();
            }
        });
        this.AddHandler('LoosedFocus', (event, args) => {
            if(!this._skipLooseFocus) {
                this._hidePopup();
            }
        });

        // перехватить keydown и обработать Escape
        this._input.AddHandler('KeyDown', (event, args) => {

            // , 'Space'
            if(['Escape', 'ArrowUp', 'ArrowDown', 'Enter', 'NumpadEnter'].indexOf(args.domEvent.code) !== -1) {

                if(args.domEvent.code === 'Escape') {
                    this._hidePopup();
                }
                else if(args.domEvent.code === 'Space') {
                    if(this.enabled) {
                        this.__Filled(null, {search: false});
                    }
                }
                else if(args.domEvent.code === 'ArrowUp') {
                    if(!this._popup) {
                        this.Focus();
                    }
                    try { this.__moveSelection(-1); } catch(e) {}
                }
                else if(args.domEvent.code === 'ArrowDown') {
                    if(!this._popup) {
                        this.Focus();
                    }
                    try { this.__moveSelection(1); } catch(e) {}
                    
                }
                else if(args.domEvent.code === 'Enter') {
                    this._popup.Dispatch('Clicked', {domEvent: args.domEvent});
                }
    
                args.domEvent.stopPropagation();
                args.domEvent.preventDefault();
                return false;
            }


            return this.Dispatch('KeyDown', args);        
        });

    }

    __Filled(event, args) {
        this._itemSelected = false;
        this.__BeforeFilled().then((searchAllreadyPerformed = false) => {
            if(this._itemSelected === true) {
                return;
            }
            
            const values = this._search(!this.searchable || !args.search || searchAllreadyPerformed ? '' : this._input.value);
            this._showPopup(values);
            
            // if(this.allowempty) {
            //     this.Dispatch('Changed', args);
            // }

            this._renderValue(false);
        });

        args?.domEvent?.preventDefault();
        args?.domEvent?.stopPropagation();

        return false;
    }

    async __BeforeFilled() {
        return true;
    }

    __Cleared(event, args) {
        const values = this._search(!this.searchable ? '' : this._input.value);
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
        if(this.enabled) {
            this.__Filled(null, {search: false});
        }    
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
            this.SendToBack();
        }
    }

    _hidePopup() {
        this._removePopup();
        this._input.SendToBack();
        this._changeBodyScroll();
    }

    /**
     * Показать выпадащий список
     * @param {array} values массив значений
     */
    _showPopup(values) {

        if(this.readonly || !this.enabled) {
            return;
        }

        if(!this._popup) {
            this._popup = this._createPopup(values);
            this._registerPopupEventHandlers(this._popup);
        }
        else {
            this._popup.FillItems(values, this._lastValue);
        }

        if(!this._popup.shown) {
            this._popup.Show();
            if(this._popupconfig) {
                Object.assign(this._popup, this._popupconfig);
            }
            this._input.BringToFront();
        }

        this._changeBodyScroll();

    }

    __moveSelection(positionDelta) {
        if(!this._popup?.selected) {
            this._popup.selectedIndex = 0;
            return;
        }

        this._popup.selectedIndex = this._popup.selectedIndex + positionDelta;

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

    /**
     * @type {Boolean}
     */
    set multiple(value) {
        this._multiple = value === 'true' || value === true;
    }
    /**
     * @type {Boolean}
     */
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
                value = value.map(v => Object.isObject(v) ? v : this._findValue(v));
                this._lastValue = this._value = value;
            }
        }
        else if(Object.isObject(value)) {
            if (!this._multiple) {
                this._value = [];
            }
            this._lastValue = value;
            this._value.push(value);
        }
        else {
            if (!this._multiple) {
                this._value = [];
                let _found = this._findValue(value);
                if(_found) {
                    this._value.push(_found);
                    this._lastValue = _found;
                }
            
            }
            else {
                this._value = [];
                value = !Array.isArray(value) ? value.split(',') : value;
                for(const v of value) {
                    let _found = this._findValue(v);
                    if(_found) {
                        this._value.push(_found);
                        this._lastValue = _found;
                    }        
                }
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
                if(!Object.isObject(vv)) {
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
            if(renderValue) {
                let v = '';
                if(Array.isArray(this._value)) {
                    v = (this._value[0] !== '' && this._value[0] !== null && this._value[0] !== undefined ? (this._value[0][this._titleField] ?? this._value[0] ?? '') : '');
                    if(Object.isObject(v)) {
                        try { v = v[Lang.Current] } catch(e) { v = ''; };
                    }
                    else {
                        v = (v + '').stripHtml();
                    }
                }
                else {
                    if(Object.isObject(this._value)) {
                        try { v = this._value[Lang.Current] } catch(e) { v = ''; };
                    }
                    else {
                        v = (this._value + '').stripHtml();
                    }
                }
                this._input.value = v;
            }

            if(!this._placeholderempty || this.HaveValues()) {
                this._input.placeholder = (this.placeholder ?? '').stripHtml();
            } else {
                this._input.placeholder = this._placeholderempty.stripHtml();
            }
        } else {
            let itemCount = this._value.length;
            this._input._forcedClearIcon = (itemCount !== 0);
            renderValue && (this._input.value = '');

            if(itemCount === 0) {
                this._input.placeholder = this.placeholder ?? '';
            } else if(this._placeholderinfo) {
                let info = this._placeholderinfo;
                if(this._placeholderinfo instanceof Function) {
                    info = this._placeholderinfo;
                    info(this._value, this._values).then((text) => {
                        this._input.placeholder = (text + '').stripHtml();
                    });
                } else {
                    try {
                        info = eval(this._placeholderinfo);
                        info(this._value, this._values).then((text) => {
                            this._input.placeholder = (text + '').stripHtml();
                        });
                    } catch(e) {
                        this._input.placeholder = String.Pluralize(this._placeholderinfo, itemCount).stripHtml();
                    }    
                }
            } else {
                this._input.placeholder = '#{ui-selector-choosed}'.replaceAll('%s1', itemCount).replaceAll('%s2', this?.parent?.parent?.title).stripHtml();
            }
        }
        if(this._showToolTip) {
            this._input.toolTip = this._input.isValueExceeded ? (this._input.value ?? this._input.placeholder) : '';
        }
    }

    /**
     * Поставить фокус
     */
    Focus() {
        if(this._input?.readonly) {
            this._element.focus();
            this.Dispatch('ReceiveFocus', {});
        } else {
            this._input.Focus();
        }
    }

    HaveValues() {
        const values = this.values;
        return !!(values && Object.values(values).length);
    }

    /**
     * Свойство только для чтения
     * @type {Boolean}
     */
    get readonly() {
        return this._readonly;
    }
    /**
     * Свойство только для чтения
     * @type {Boolean}
     */
    set readonly(value) {
        this._readonly = value === true || value === 'true';
        if(!this._searchable) {
            this._input.readonly = true;
        } else if(this._readonly) {
            this._input.readonly = true;
        }
        else {
            this._input.readonly = false;
        }
        if(this._readonly) {
            this.AddClass('app-component-readonly');
        } else {
            this.RemoveClass('app-component-readonly');
        }
    }

    /**
     * Can search in items
     * @type {Boolean}
     */
    get searchable() {
        return this._searchable;
    }
    /**
     * Can search in items
     * @type {Boolean}
     */
    set searchable(value) {
        this._searchable = value === true || value === 'true';
        if(this._searchable) {
            this.AddClass('app-component-searchable');
            this._input.readonly = false;
        }
        else {
            this.RemoveClass('app-component-searchable');
            this.tabIndex = -1;
            this._input.readonly = true;
        }
    }

    /**
     * Текст для отображения вместо значения
     * @type {String}
     */
    get placeholder() {
        return this._placeholder;
    }
    /**
     * Текст для отображения вместо значения
     * @type {String}
     */
    set placeholder(value) {
        this._placeholder = value ? value[Lang.Current] ?? value : '';
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

    /**
     * @type {Function}
     */
    get placeholderempty() {
        return this._placeholderempty;
    }
    /**
     * @type {Function}
     */
    set placeholderempty(value) {
        this._placeholderempty = value;
    }

    /**
     * Вкючено/выключено
     * @type {Boolean}
     */
    get enabled() {
        return this._input.enabled;
    }
    /**
     * Вкючено/выключено
     * @type {Boolean}
     */
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
     * @type {Array}
     */
    get values() {
        return this._values;
    }
    /**
     * Список значений
     * @type {Array}
     */
    set values(value) {
        this._values = value;
        this._renderValue(false);
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

        let searchPattern = new RegExp('.*?' + String.EscapeRegExp(searchString.stripHtml()).replaceAll(/\s+/, '.+') + '.*?', 'i');
        let values = this._values;
        let matches = [];
        let startMatches = [];

        Array.isArray(values) && values.forEach((value) => {
            let stringPosition = value[this._titleField] ? value[this._titleField].search(searchPattern) : 0;
            if (stringPosition !== -1) {
                stringPosition === 0 ? startMatches.push(value) : matches.push(value);
            }
        });

        // элементы, которые начинаются со строки поиска, переносятся в начало списка
        return startMatches.concat(matches);
    }

    /**
     * @type {Any}
     */
    get popupconfig() {
        return this._popupconfig;
    }
    /**
     * @type {Any}
     */
    set popupconfig(value) {
        this._popupconfig = value;
    }

    /**
     * Индекс табуляции
     * @type {Number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Индекс табуляции
     * @type {Number}
     */
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value;
        }
    }

    _createPopup(values) {
        const popup = new Colibri.UI.PopupList(this.name + '-select-popup', document.body, this._multiple, this.__render, this._titleField, this._valueField, this._groupField, this._canSelectGroup);
        popup.parent = this;
        popup.multiple = this._multiple;
        const el = this.container.closest('[namespace]');
        el && popup.container.attr('namespace', el.attr('namespace'));

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
                return false;
            }

            this._setValue(selected);
            this._renderValue(!this._multiple);
            this.Focus();
            this.Dispatch('Changed', args);
            
            return false;
        });
        

        popup.AddHandler('ShadowClicked', () => {
            this._hidePopup();
            this.Focus();
        });
    }

    /**
     * Можно ли выбирать группу
     * @type {Boolean}
     */
    get canSelectGroup() {
        return this._canSelectGroup;
    }
    /**
     * Можно ли выбирать группу
     * @type {Boolean}
     */
    set canSelectGroup(value) {
        this._canSelectGroup = value;
    }

    /**
     * Shows the component
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }
    /**
     * Shows the component
     * @type {boolean}
     */
    set shown(value) {
        super.shown = value;
        this._removePopup();
    }

    /**
     * Title field name 
     * @type {string}
     */
    get titleField() {
        return this._titleField;
    }
    /**
     * Title field name 
     * @type {string}
     */
    set titleField(value) {
        this._titleField = value;
    }

    /**
     * Value field name
     * @type {string}
     */
    get valueField() {
        return this._valueField;
    }
    /**
     * Value field name
     * @type {string}
     */
    set valueField(value) {
        this._valueField = value;
    }

    /**
     * Tooltip string
     * @type {String}
     */
    get showToolTip() {
        return this._showToolTip;
    }
    /**
     * Tooltip string
     * @type {String}
     */
    set showToolTip(value) {
        this._showToolTip = value === true || value === 'true';
        this._renderValue();
    }

}

