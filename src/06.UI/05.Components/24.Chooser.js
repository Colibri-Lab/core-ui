Colibri.UI.Chooser = class extends Colibri.UI.Component {

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
    constructor(name, container, multiple = false, readonly = true, placeholder = '', selector = null, defaultValue = null, allowEmpty = true, clearIcon = false) {
        super(name, container, Element.create('div'));

        this.AddClass('app-chooser-component');

        this._multiple = multiple;
        this._selector = selector;
        this._titleField = this._selector?.title || 'title';
        this._valueField = this._selector?.value || 'value';
        this._default = defaultValue;
        if(typeof this._selector?.chooser == 'string') {
            this._chooser = this._selector?.chooser ? eval(this._selector?.chooser) : null;
        }
        else if(typeof this._selector?.chooser == 'function') {
            this._chooser = this._selector?.chooser ? this._selector?.chooser : null;
        }
        this._value = [];
        this._placeholder = placeholder || '#{ui-selector-nothingchoosed}';

        this._input =  new Colibri.UI.Input(this._name + '-input', this);
        this._input.shown = true;
        this._input.icon = null;
        this._input.readonly = true;
        this._input.hasIcon = false;
        this._input.hasClearIcon = (clearIcon || !readonly);
        this._input.placeholder = this._placeholder;

        this._arrow = Element.create('span', {class: 'arrow'});
        this._arrow.html(Colibri.UI.ChooserIcon);
        this._element.append(this._arrow);

        this.readonly = readonly;
        this.allowempty = allowEmpty;

        this._setValue(this._default);
        this._renderValue();

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', (event, args) => {
            this._input.toolTip = this._input.isValueExceeded ? this._input.value : '';
        });

        this._handleEvents();
    }

    /**
     * Регистрация событий
     */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('Changed', false, 'Когда выбор изменился');
        this.RegisterEvent('ChooserClicked', false, 'Когда нажали на кнопку выбора');
    }

    ShowChooser() {
        if(this._chooser) {
            const component = this._chooser;
            if(!this._chooserObject) {
                this._chooserObject = new component(this.name + '-chooser', document.body, this._selector?.params || {}, this._values, this._selector.title, this._selector.value);
                this._chooserObject.AddHandler('Choosed', (event, args) => {
                    this.value = args.value;
                    this.valueObject = args.valueObject;
                    this.Dispatch('Changed', {});
                });
            }
            this._chooserObject.Show();
        } 
        else {
            this.Dispatch('ChooserClicked', {currentValue: this._value});
        }
        return false; 
    }

    /**
     * Регистрация обработчиков событий
     */
    _handleEvents() {

        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));

        this._input.AddHandler('Filled', (event, args) => this.__Filled(event, args));
        this._input.AddHandler('Cleared', (event, args) => this.__Cleared(event, args));

        this._arrow.addEventListener('click', (e) => {
            if(!this.readonly) {
                this.__Filled(null, {search: false});
            }
            return false; 
        });

        // перехватить keydown и обработать Escape
        this._input.AddHandler('KeyDown', (event, args) => {

            if(['Enter', 'NumpadEnter'].indexOf(args.domEvent.code) !== -1) {
                if(!this.readonly) {
                    this.__Filled(null, {search: false});
                }
                args.domEvent.stopPropagation();
                args.domEvent.preventDefault();
                return false;
            }


            return this.Dispatch('KeyDown', args);        
        });

    }

    
    async __BeforeFilled() {
        return true;
    }


    __Filled(event, args) {
        this._itemSelected = false;
        this.__BeforeFilled().then((ret) => {
            if(ret === false || this._itemSelected === true) {
                return;
            }
            
            this.ShowChooser();
            this._renderValue(false);
        });

        args?.domEvent?.preventDefault();
        args?.domEvent?.stopPropagation();

        return false;
    }

    __Cleared(event, args) {
        this._setValue(null);
        this.Dispatch('Changed', args);
        this._renderValue();

        args.domEvent?.preventDefault();
        args.domEvent?.stopPropagation();
        return false;
    }

    /**
     * Выбранное значение
     * @return array|Object|boolean
     */
    get value() {
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

    get valueObject() {
        return this._valueObject;
    }
    set valueObject(value) {
        this._valueObject = value;
    }

    set multiple(value) {
        this._multiple = value === 'true' || value === true;
    }

    get multiple() {
        return this._multiple;
    }

    /**
     * Shows open button
     * @type {bool}
     */
    get openButton() {
        return this._openButton;
    }
    /**
     * Shows open button
     * @type {bool}
     */
    set openButton(value) {
        this._openButton = value;
        this._showOpenButton();
    }
    _showOpenButton() {
        this._arrow.css('display', this._openButton ? 'block' : 'none');
    }


    /**
     * Установить выбранное значение
     * @param {Object|Array} value
     */
    _setValue(value) {

        if( value && this.multiple && !Array.isArray(value) ) {
            throw 'Value must be array of an object/string, becose it is multiple';
        }
        this._value = value;
    }

    /**
     * Отобразить значения
     */
    _renderValue() {

        const set = () => {
            // this._value = [string] | [{title, value}] | null
            if(!this._value) {
                this._input.value = '';
                return;
            }
            
            if (!this.multiple) {
                if(!Object.isObject(this._value)) {
                    this._value = Array.findObject(this.values, this._valueField, this._value);
                }
                const v = Object.isObject(this._value) ? (this._value[this._titleField] ?? this._value[this._valueField] ?? '') : this._value
                this._input.value = Lang ? Lang.Translate(v) : v;
            } else {
                const values = this._value.map((v) => {
                    if(!Object.isObject(v)) {
                        v = Array.findObject(this.values, this._valueField, v);
                    }    
                    v = Object.isObject(v) ? (v[this._titleField] ?? v[this._valueField] ?? '') : v;
                    return Lang ? Lang.Translate(v) : v;
                });
                this._input.value = values.join(', ');
            }
            this._input.toolTip = this._input.isValueExceeded ? this._input.value : '';
        }
        
        if(!this.values) {
            Colibri.Common.Wait(Array.isArray(this.values)).then(() => {
                set();
            })
        } else {
            set();
        }

        
    }

    /**
     * Поставить фокус
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Свойство только для чтения
     */
    get readonly() {
        return !!this._readonly;
    }
    set readonly(value) {
        if(value === true || value === 'true') {
            this.AddClass('app-component-readonly');
            this._readonly = true;
        }
        else {
            this.RemoveClass('app-component-readonly');
            this._readonly = false;
        }
    }

    /**
     * Текст для отображения вместо значения
     */
    get placeholder() {
        return this._placeholder;
    }
    set placeholder(value) {
        this._placeholder = Lang ? Lang.Translate(value) : value;
        this._input.placeholder = this._placeholder;
        this._renderValue(false);
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

    /**
     * Список значений
     */
    get values() {
        return this._values;
    }
    set values(value) {
        this._values = value;
        this._renderValue();
    }

}

Colibri.UI.Chooser.ChooseWindow = class extends Colibri.UI.Window {

    constructor(name, container, element, title, width, height) {
        super(name, container, element, title, width, height);
    }

    _registerEvents() {
        this.RegisterEvent('Choosed', false, 'Когда выбор сделан');
    }

    get params() {
        return this._params;
    }
    set params(value) {
        this._params = value;
    }
    
}

