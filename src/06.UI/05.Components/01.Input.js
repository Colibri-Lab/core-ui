/**
 * @class
 * @namespace
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Input = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {Element|string} element to create in
     */
    constructor(name, container, element) {
        super(name, container, Element.create('div', { class: 'app-ui-component' }));

        this.GenerateChildren(element, this._element);

        this._hasClearIcon = true;
        this._changeOnKeyUpTimeout = 3000;

        this.AddClass('app-input-component');

        this._fillTimeoutValue = 500;
        this._showClearIconAllways = false;

        new Colibri.UI.Icon('icon', this);
        new Colibri.UI.Pane('loadingicon', this);

        this._input = Element.create('input', { type: 'text', placeholder: this.placeholder || '' });
        this._element.append(this._input);

        new Colibri.UI.Icon('clear', this);

        this.Children('icon').shown = true;
        this.Children('clear').html = Colibri.UI.ClearIcon;
        this.Children('loadingicon').html = Colibri.UI.LoadingIcon;
        this.Children('icon').value = Colibri.UI.SearchIcon;

        this._input.addEventListener('keyup', (e) => {

            if (['Tab', 'Escape', 'Enter', 'ArrowDown', 'ArrowUp', 'Space'].indexOf(e.code) !== -1) {
                return true;
            }

            if (!!this.maxlength && this.type != 'text') {
                if ((this.value + '').length > this.maxlength) {
                    this.value = (this.value + '').substring(0, this.maxlength);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            if (!this._showClearIconAllways) {
                if (this.readonly) {
                    this.Children('clear').shown = false;
                } else {
                    this.Children('clear').shown = this._hasClearIcon && this._input.value.length > 0;
                }
            } else {
                this.Children('clear').shown = this._input.value.length > 0;
            }

            this.Dispatch('KeyUp', { value: this.value, domEvent: e });

            if (this._changeOnKeyUp) {
                if (this._changeOnKeyUpTimeoutId) {
                    clearTimeout(this._changeOnKeyUpTimeoutId);
                }
                this._changeOnKeyUpTimeoutId = setTimeout(() => this.Dispatch('Changed', { value: this.value, domEvent: e }), this._changeOnKeyUpTimeout);
            }

            if (this._fillTimeout) {
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

        this._input.addEventListener('mousedown', (e) => {
            e.target.focus();
            //e.target.select();
            return false;
        });


        this._input.addEventListener('paste', (e) => {
            Colibri.Common.Delay(100).then(() => {
                this.Dispatch('Pasted', { domEvent: e });
            });
        });

        this.Children('clear').AddHandler('Clicked', this.__clearClicked, false, this);

        this._input.addEventListener('blur', (e) => {
            this.Dispatch('LoosedFocus', { value: this.value, domEvent: e });
        });

        this.AddHandler('LoosedFocus', this.__thisLoosedFocus);
        this.AddHandler('ReceiveFocus', this.__thisReceiveFocus);

    }

    __clearClicked(event, args) {
        if (!this.enabled) {
            return;
        }
        this.Dispatch('BeforeClear', args);
        if (args.cancel) {
            return;
        }

        this._input.value = '';
        this._input.focus();
        this.Children('clear').shown = this._showClearIconAllways;
        this.loading = false;
        this.Dispatch('Cleared', args);
    }

    __thisLoosedFocus(event, args) {
        if (this._popup) {
            this._popup.Hide();
            this._popup.Dispose();
            this._popup = null;
        }
    }
    __thisReceiveFocus(event, args) {
        this._showSuggestions();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('KeyUp', false, 'Поднимается, когда клавиша поднята');
        this.RegisterEvent('KeyDown', false, 'Поднимается, когда клавиша нажата');
        this.RegisterEvent('Changed', false, 'Поднимается, когда содержимое поля обновлено');
        this.RegisterEvent('Filled', false, 'Поднимается, когда содержимое поля обновлено и не изменилось в течении fillTimeout мс');
        this.RegisterEvent('Cleared', false, 'When clear icon is clicked and input is cleared');
        this.RegisterEvent('BeforeClear', false, 'Before clear is complete');
    }

    /**
     * Focus on component
     * @returns this
     */
    Focus() {
        this._input.focus();
        return this;
    }

    /**
     * Select content of input
     * @returns this
     */
    Select() {
        if (!this.readonly) {
            this._input.select();
        }
        return this;
    }

    /** 
     * Show/Hide loading
     * @type {boolean} 
     */
    get loading() {
        return this.Children('loadingicon').shown;
    }
    /** 
     * Show/Hide loading
     * @type {boolean} 
     */
    set loading(value) {
        value = this._convertProperty('Boolean', value);
        if (this.hasIcon) {
            this.Children('icon').shown = !value;
        }
        this.Children('loadingicon').shown = value;
    }
    /** @private */
    _hideLoading() {
        if (this.icon) {
            this.icon.shown = true;
        }
        this.loadingicon.shown = false;
    }

    /** 
     * Max length in chars of input
     * @type {number} 
     */
    get maxlength() {
        return this._input.attr('maxlength');
    }
    /** 
     * Max length in chars of input
     * @type {number} 
     */
    set maxlength(value) {
        value = this._convertProperty('Number', value);
        this._input.attr('maxlength', value);
    }

    /** 
     * Type of input
     * @type {string} 
     */
    get type() {
        return this._input.attr('type');
    }
    /** 
     * Type of input
     * @type {string} 
     */
    set type(value) {
        value = this._convertProperty('String', value);
        this._input.attr('type', value);
    }

    /** 
     * Input placeholder
     * @type {string} 
     */
    get placeholder() {
        try {
            return this._input.attr('placeholder');
        }
        catch (e) {
            return '';
        }
    }
    /** 
     * Input placeholder
     * @type {string} 
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.attr('placeholder', value ? (value[Lang.Current] ?? value) : '');
    }

    /** 
     * Input icon
     * @type {string} 
     */
    get icon() {
        return this.Children('icon').html;
    }
    /** 
     * Input icon
     * @type {string} 
     */
    set icon(value) {
        value = this._convertProperty('String', value);
        if (value === null) {
            this.Children('icon').html = '';
            this.Children('icon').shown = false;
        }
        else {
            this.Children('icon').html = eval(value);
            this.Children('icon').shown = true;
        }
    }

    /**
     * Clear icon
     * @type {String}
     */
    get clearIcon() {
        return this.Children('clear').iconSVG;
    }
    /**
     * Clear icon
     * @type {String}
     */
    set clearIcon(value) {
        this.Children('clear').iconSVG = value;
    }

    /** 
     * Input value
     * @type {string} 
     */
    get value() {
        return this._input.value;
    }
    /** 
     * Input value
     * @type {string} 
     */
    set value(value) {
        value = this._convertProperty('String', value);
        this._input.value = value;
        if (this.Children('clear') && !this._showClearIconAllways) {
            this.Children('clear').shown = this._hasClearIcon && this._input.value.length > 0;
        }
    }

    /** 
     * Input is readonly
     * @type {boolean} 
     */
    get readonly() {
        return this._input.is(':scope[readonly]');
    }
    /** 
     * Input is readonly
     * @type {boolean} 
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        if (value === true || value === 'true') {
            this._input.attr('readonly', 'readonly').attr('tabindex', '-1');
        }
        else {
            this._input.attr('readonly', null).attr('tabindex', null);
        }
        this.Dispatch('ReadonlyStateChanged');
    }

    /** 
     * Input has icon
     * @type {boolean} 
     */
    set hasIcon(value) {
        value = this._convertProperty('Boolean', value);
        this.Children('icon').shown = value;
    }
    /** 
     * Input has icon
     * @type {boolean} 
     */
    get hasIcon() {
        return this.Children('icon').shown;
    }

    /** 
     * Input has clear icon
     * @type {boolean} 
     */
    set hasClearIcon(value) {
        value = this._convertProperty('Boolean', value);
        this._hasClearIcon = value;
        this.Children('clear').shown = value;
    }
    /** 
     * Input has clear icon
     * @type {boolean} 
     */
    get hasClearIcon() {
        return this._hasClearIcon;
    }

    /** 
     * Enable/disable input
     * @type {Boolean} 
     */
    get enabled() {
        return super.enabled;
    }
    /** 
     * Enable/disable input
     * @type {Boolean} 
     */
    set enabled(val) {
        val = this._convertProperty('Boolean', val);
        super.enabled = val;
        this._input.attr('disabled', val === true || val === 'true' ? null : 'disabled');
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input.attr('tabIndex');
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        value = this._convertProperty('Number', value);
        this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

    /**
     * Mask string 
     * @type {string}
     */
    get mask() {
        if (this._masker) {
            return this._masker.opts.pattern;
        }
        return null;
    }
    /**
     * Mask string 
     * @type {string}
     */
    set mask(value) {
        value = this._convertProperty('String', value);
        this._masker = new Colibri.UI.Utilities.Mask([this._input]);
        this._masker.maskPattern(value);
    }

    /**
     * Suggestions array
     * @type {Array}
     */
    get suggestions() {
        return this._suggestions;
    }
    /**
     * Suggestions array
     * @type {Array}
     */
    set suggestions(value) {
        value = this._convertProperty('Array', value);
        this._suggestions = value;
    }
    /** @private */
    _createPopup(values) {
        const popup = new Colibri.UI.PopupList('select-popup', document.body, this._multiple, this.__render, this._titleField, this._valueField, this._groupField);
        popup.parent = this;
        popup.multiple = this._multiple;
        const el = this.container.closest('[namespace]');
        el && popup.container.attr('namespace', el.attr('namespace'));
        //заполнение списка перед хэндлерами, чтобы не сработал SelectionChanged
        popup.FillItems(values, this._value);
        popup.AddHandler('MouseDown', this.__popupMouseDown, false, this);
        return popup;
    }

    __popupMouseDown(event, args) {
        this._input.value = event?.sender?.selected?.value;
    }

    /** @private */
    _showSuggestions() {
        if (this._suggestions && this._suggestions.length > 0) {
            if (!this._popup) {
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
        value = this._convertProperty('Number', value);
        this._fillTimeoutValue = value;
    }

    /**
     * Is value of input exceeded input width
     * @type {Boolean}
     */
    get isValueExceeded() {
        return this._input.isValueExceeded();
    }

    /**
     * Show clear icon allways
     * @type {Boolean}
     */
    get showClearIconAllways() {
        return this._showClearIconAllways;
    }
    /**
     * Show clear icon allways
     * @type {Boolean}
     */
    set showClearIconAllways(value) {
        value = this._convertProperty('Boolean', value);
        this._showClearIconAllways = value;
        if (value) {
            this.Children('clear').shown = true;
        }
    }


    /**
     * Change on key up event
     * @type {Boolean}
     */
    get changeOnKeyUp() {
        return this._changeOnKeyUp;
    }
    /**
     * Change on key up event
     * @type {Boolean}
     */
    set changeOnKeyUp(value) {
        this._changeOnKeyUp = value;
    }

    /**
     * Timeout for Change event on KeyUp
     * @type {Number}
     */
    get changeOnKeyUpTimeout() {
        return this._changeOnKeyUpTimeout;
    }
    /**
     * Timeout for Change event on KeyUp
     * @type {Number}
     */
    set changeOnKeyUpTimeout(value) {
        this._changeOnKeyUpTimeout = value;
    }

}