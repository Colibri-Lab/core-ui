Colibri.UI.Input = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, Element.create('div', {class: 'app-ui-component'}));

        this.GenerateChildren(element, this._element);

        this._hasClearIcon = true;

        this.AddClass('app-input-component');

        this._fillTimeoutValue = 500;

        new Colibri.UI.Icon('icon', this);
        new Colibri.UI.Pane('loadingicon', this);

        this._input = Element.create('input', { type: 'text', placeholder: this.placeholder || '' });
        this._element.append(this._input);

        new Colibri.UI.Pane('clear', this);

        this.Children('icon').shown = true;
        this.Children('clear').html = Colibri.UI.ClearIcon;
        this.Children('loadingicon').html = Colibri.UI.LoadingIcon;
        this.Children('icon').value = Colibri.UI.SearchIcon;

        this._input.addEventListener('keyup', (e) => {

            if(['Tab', 'Escape', 'Enter', 'ArrowDown', 'ArrowUp', 'Space'].indexOf(e.code) !== -1) {
                return true;
            }

            if(this.readonly) {
                this.Children('clear').shown = false;
            } else if(this._hasClearIcon) {
                this.Children('clear').shown = this._input.value.length > 0;
            }

            this.Dispatch('KeyUp', { value: this.value, domEvent: e });

            if(this._fillTimeout) {
                clearTimeout(this._fillTimeout);
                this._fillTimeout = null;
            }

            this._fillTimeout = setTimeout(() => {
                this.Dispatch('Filled', { value: this.value });
            }, this._fillTimeoutValue);

        });

        this._input.addEventListener('change', (e) => {
            this.Dispatch('Changed', { value: this.value, domEvent: e });
        });

        this._input.addEventListener('keydown', (e) => {
            this.Dispatch('KeyDown', { value: this.value, domEvent: e });
        });

        this._input.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', { domEvent: e }));
        this._input.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', { domEvent: e }));

        this._input.addEventListener('mousedown', (e) => {
            e.target.focus();
            //e.target.select();
            return false;
        });

        this.Children('clear').AddHandler('Clicked', (event, args) => {
            if(!this.enabled) {
                return;
            }
            this._input.value = '';
            this._input.focus();
            // this._input.select();
            this.Children('clear').shown = false;
            this.loading = false;
            this.Dispatch('Cleared', args);
        });

        this._input.addEventListener('blur', (e) => {
            this.Dispatch('LoosedFocus', { value: this.value, domEvent: e });
        });

        this.AddHandler('LoosedFocus', (event, args) => {
            if(this._popup) {
                this._popup.Hide();
                this._popup.Dispose();
                this._popup = null;
            }
        });
        this.AddHandler('ReceiveFocus', (event, args) => {
            this._showSuggestions();
        });

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('KeyUp', false, 'Поднимается, когда клавиша поднята');
        this.RegisterEvent('KeyDown', false, 'Поднимается, когда клавиша нажата');
        this.RegisterEvent('Changed', false, 'Поднимается, когда содержимое поля обновлено');
        this.RegisterEvent('Filled', false, 'Поднимается, когда содержимое поля обновлено и не изменилось в течении fillTimeout мс');
        this.RegisterEvent('Cleared', false, 'Поднимается, когда содержимое поля очищено с помощью крестика');
    }

    /**
     * Ставит фокус на компоменту
     * @returns {Colibri.UI.Component}
     */
    Focus() {
        this._input.focus();
        return this;
    }

    Select() {
        if(!this.readonly) {
            this._input.select();
        }
        return this;
    }

    /** 
     * @type {Boolean} 
     */
    get loading() {
        return this.Children('loadingicon').shown;
    }
    /** 
     * @type {Boolean} 
     */
    set loading(value) {
        //this.Children('icon').shown = !value;
        this.Children('loadingicon').shown = value;
    }

    _hideLoading() {
        this.icon.shown = true;
        this.loadingicon.shown = false;
    }

    /** 
     * @type {Number} 
     */
    get maxlength() {
        return this._input.attr('maxlength');
    }
    /** 
     * @type {Number} 
     */
    set maxlength(value) {
        this._input.attr('maxlength', value);
    }

    /** 
     * @type {String} 
     */
    get type() {
        return this._input.attr('type');
    }
    /** 
     * @type {String} 
     */
    set type(value) {
        this._input.attr('type', value);
    }

    /** 
     * @type {String} 
     */
    get placeholder() {
        try {
            return this._input.attr('placeholder');
        }
        catch(e) {
            return '';
        }
    }
    /** 
     * @type {String} 
     */
    set placeholder(value) {
        this._input.attr('placeholder', value ? (value[Lang.Current] ?? value) : '');
    }

    /** 
     * @type {String} 
     */
    get icon() {
        return this.Children('icon').html;
    }
    /** 
     * @type {String} 
     */
    set icon(value) {
        if(value === null) {
            this.Children('icon').html = '';
            this.Children('icon').shown = false;
        }
        else {
            this.Children('icon').html = eval(value);
            this.Children('icon').shown = true;
        }
    }

    /** 
     * @type {String} 
     */
    get value() {
        return this._input.value;
    }
    /** 
     * @type {String} 
     */
    set value(value) { 
        this._input.value = value;
        if(this._hasClearIcon && this.Children('clear')) {
            this.Children('clear').shown = (this._input.value.length > 0 ? (this._forcedClearIcon ?? false) : false);
        }
    }

    /** 
     * @type {Boolean} 
     */
    get readonly() {
        return this._input.is(':scope[readonly]');
    }
    /** 
     * @type {Boolean} 
     */
    set readonly(value) {
        if(value === true || value === 'true') {
            this._input.attr('readonly', 'readonly').attr('tabindex', '-1');
        }
        else {
            this._input.attr('readonly', null).attr('tabindex', null);
        }
        this.Dispatch('ReadonlyStateChanged');
    }

    /** 
     * @type {Boolean} 
     */
    set hasIcon(value) {
        this.Children('icon').shown = value;
    }
    /** 
     * @type {Boolean} 
     */
    get hasIcon() {
        return this.Children('icon').shown;
    }

    /** 
     * @type {Boolean} 
     */
    set hasClearIcon(value) {
        this._hasClearIcon = value;
        this.Children('clear').shown = value;
    }
    /** 
     * @type {Boolean} 
     */
    get hasClearIcon() {
        return this._hasClearIcon;
    }

    /** @type {Boolean} */
    get enabled() {
        return super.enabled;
    }
    /** @type {Boolean} */
    set enabled(val) {
        super.enabled = val;
        this._input.attr('disabled', val === true || val === 'true' ? null : 'disabled');
    }

    /**
     * Индекс табуляции
     * @type {number}
     */
    get tabIndex() {
        return this._input.attr('tabIndex');
    }
    /**
     * Индекс табуляции
     * @type {number}
     */
    set tabIndex(value) {
        this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

    /** @type {string} */
    get mask() {
        if(this._masker) {
            return this._masker.opts.pattern;
        }
        return null;
    }
    /** @type {string} */
    set mask(value) {
        this._masker = new Colibri.UI.Utilities.Mask([this._input]);
        this._masker.maskPattern(value);
    }

    /**
     * Подсказки
     * @type {Array}
     */
    get suggestions() {
        return this._suggestions;
    }
    /**
     * Подсказки
     * @type {Array}
     */
    set suggestions(value) {
        this._suggestions = value;
    }

    _createPopup(values) {
        const popup = new Colibri.UI.PopupList('select-popup', document.body, this._multiple, this.__render, this._titleField, this._valueField, this._groupField);
        popup.parent = this;
        popup.multiple = this._multiple;
        const el = this.container.closest('[namespace]');
        el && popup.container.attr('namespace', el.attr('namespace'));
        //заполнение списка перед хэндлерами, чтобы не сработал SelectionChanged
        popup.FillItems(values, this._value);
        popup.AddHandler('MouseDown', (event, args) => {
            this._input.value = popup?.selected?.value;
        });
        return popup;
    }

    _showSuggestions() {
        if(this._suggestions && this._suggestions.length > 0) {
            if(!this._popup) {
                this._popup = this._createPopup(this._suggestions);
            }
            this._popup.Show();    
        }
    }

    /**
     * Fill timeout, default is 500
     * @type {Number}
     */
    get fillTimeout() {
        return this._fillTimeoutValue;
    }
    /**
     * Fill timeout, default is 500
     * @type {Number}
     */
    set fillTimeout(value) {
        this._fillTimeoutValue = value;
    }

}