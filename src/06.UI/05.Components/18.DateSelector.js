/**
 * Date selector component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.DateSelector = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));

        this.AddClass('app-date-selector-component');

        this._hiddenElement = Element.create('input', { type: 'date', class: 'ui-hidden', name: name });
        this._viewElement = Element.create('input', { type: 'text', name: name + '_view' });

        this._icon = new Colibri.UI.Icon('icon', this);
        this._icon.value = Colibri.UI.CalendarIcon;
        this._icon.shown = true;

        this._element.append(this._hiddenElement);
        this._element.append(this._viewElement);

        this._clearIcon = new Colibri.UI.Icon('clear-icon', this);
        this._clearIcon.value = Colibri.UI.ClearIcon;
        this._clearIcon.shown = false;

        this._min = new Date(-8640000000000000);
        this._max = new Date(8640000000000000);

        this._hiddenElement.addEventListener('click', (e) => { 
            this.Dispatch('Clicked', { domEvent: e }); 
            e.preventDefault(); 
            e.stopPropagation(); 
            return false; 
        });
        this._hiddenElement.addEventListener('change', (e) => {
            this._showValue();
            if (this._changeTimeout) {
                clearTimeout(this._changeTimeout);
                this._changeTimeout = -1;
            }
            this._changeTimeout = setTimeout(() => {
                this.Dispatch('Changed');
            }, 500);

            e.preventDefault();
        });
        this._hiddenElement.addEventListener('blur', (e) => {
            if (!this._skipLooseFocus) {
                if (this.value < this._min) {
                    this.value = this._min;
                } else if (this.value > this._max) {
                    this.value = this._max;
                }
                this._showValue();
                this.Dispatch('Changed');
                this.Close();
            }
        });
        // this._hiddenElement.addEventListener('keydown', (e) => {
        //     e.stopPropagation(); 
        // });

        this._clearIcon.AddHandler('Clicked', this.__clearIconClicked, false, this);

        this._viewElement.addEventListener('click', (e) => this.Dispatch('Clicked', { domEvent: e }));
        this._viewElement.addEventListener('dblclick', (e) => this.Dispatch('DoubleClicked', { domEvent: e }));
        this._viewElement.addEventListener('mousedown', (e) => this.Dispatch('MouseDown', { domEvent: e }));
        this._viewElement.addEventListener('mouseup', (e) => this.Dispatch('MouseUp', { domEvent: e }));
        this._viewElement.addEventListener('mousemove', (e) => this.Dispatch('MouseMove', { domEvent: e }));
        this._viewElement.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', { domEvent: e }));
        this._viewElement.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', { domEvent: e }));
        this._viewElement.addEventListener('keydown', this.__viewerKeyDown, false, this);
        this._viewElement.addEventListener('keyup', nullhandler);
        this._viewElement.addEventListener('keypress', nullhandler);

        this._hiddenElement.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', { domEvent: e }));
        this._hiddenElement.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', { domEvent: e }));


        let dateformat = App.DateFormat || 'ru-RU';
        this._format = new Intl.DateTimeFormat(dateformat, { day: '2-digit', month: 'short', year: 'numeric' });

        this.AddHandler('Clicked', this.__thisClicked);
        this.AddHandler('KeyDown', this.__thisKeyDown);


    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __viewerKeyDown(event, args) {
        if(args.domEvent.key === 'Tab') {
            return true;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;


    }
    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisClicked(event, args) {
        if (this.enabled) {
            this.Open();
        }
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }
    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisKeyDown(event, args) {
        if (['Escape', 'Enter', 'Space'].indexOf(args.domEvent.code) !== -1) {
            if (this.enabled) {
                if (args.domEvent.code === 'Space') {
                    this.Open();
                }
                else if (args.domEvent.code === 'Escape') {
                    this.Close();
                }
                else if (args.domEvent.code === 'Enter') {
                    this.Close();
                }
            }

            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        }
    }

    /**
     * Show hide clear icon
     * @type {Boolean}
     */
    get clearIcon() {
        return this._showClearIcon;
    }
    /**
     * Show hide clear icon
     * @type {Boolean}
     */
    set clearIcon(value) {
        this._showClearIcon = value;
        this._clearIcon.shown = this._showClearIcon && this._viewElement.value !== '';
    }


    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When value is changed');
        this.RegisterEvent('Cleared', false, 'When clear icon clicked');
        this.RegisterEvent('PopupOpened', false, 'When popup is opened');
        this.RegisterEvent('PopupClosed', false, 'When popup is closed');
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __clearIconClicked(event, args) {
        this.value = '';
        this.Dispatch('Cleared');
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

    /** 
     * @ignore
     * @private 
     */
    _showValue() {

        try {
            this._viewElement.value = this._format.format(this.value);
        }
        catch (e) {
            this._viewElement.value = '';
        }

        if (this._popup) {
            try {
                this._popup.value = this.value;
            }
            catch (e) {
                this._popup.value = new Date();
            }
        }

        this._clearIcon.shown = this._showClearIcon && this._viewElement.value !== '';

    }

    /**
     * Open selector
     * @public
     */
    Open() {
        if (!this._popup) {
            this._popup = new Colibri.UI.DateSelectorPopup('popup', document.body);
            this._popup.parent = this;
            const el = this.container.closest('[namespace]');
            el && this._popup.container.attr('namespace', el.attr('namespace'));
        }
        this._skipLooseFocus = true;
        this._popup.mode = 'datepicker';
        this._popup.shown = true;
        this._popup.value = this.value;
        this._showValue();
        this.ToggleView(true);
        this._hiddenElement.focus();
        this._popup?.BringToFront(); 
        this.Dispatch('PopupOpened', {});

    }

    /**
     * Close selector
     * @public
     */
    Close() {
        this.ToggleView(false);
        if (this._popup) {
            this._popup.Dispose();
            this._popup = null;
        }
        this._viewElement.focus();

        this.Dispatch('PopupClosed', {});
    }

    /**
     * Focus on component
     * @public
     */
    Focus() {
        if (!this.enabled) {
            return;
        }
        this.ToggleView(true);
        this._hiddenElement.focus();
    }

    /**
     * Toggle view of input
     * @param {boolean} view toggle view of input
     * @public
     */
    ToggleView(view) {

        if (!view) {
            this._viewElement.classList.remove('ui-hidden');
            this._hiddenElement.classList.add('ui-hidden');
            this._hiddenElement.css('position', null);
            this._hiddenElement.css('z-index', null);
            this.value && this.value != 'Invalid Date' && (this._viewElement.value = this._format.format(this.value));
        }
        else {
            this._viewElement.classList.add('ui-hidden');
            this._hiddenElement.classList.remove('ui-hidden');
            this._hiddenElement.css('position', 'relative');
            this._hiddenElement.css('z-index', Colibri.UI.maxZIndex + 1);
        }

    }

    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        this._viewElement.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._viewElement.attr('placeholder');
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        this._viewElement.attr('disabled', value ? null : 'disabled');
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._viewElement.attr('disabled') !== 'disabled';
    }

    /**
     * Is component readonly
     * @type {boolean}
     */
    set readonly(value) {
        this._viewElement.attr('readonly', value ? 'readonly' : null);
    }

    /**
     * Is component readonly
     * @type {boolean}
     */
    get readonly() {
        return this._viewElement.attr('readonly') !== 'readonly';
    }

    /**
     * Date value
     * @type {Date|string}
     */
    set value(value) {
        const oldValue = this._hiddenElement.value;
        if (!value) {
            this._hiddenElement.value = '';
        } else if (typeof value == 'string') {
            this._hiddenElement.value = value;
        } else if (value instanceof Date) {
            this._hiddenElement.value = value.toShortDateString();
        } else {
            this._hiddenElement.value = value && value?.date ? value?.date?.toDate()?.toShortDateString() : '';
        }
        this._showValue();
        if (oldValue != this._hiddenElement.value) {
            this.Dispatch('Changed');
        }
    }

    /**
     * Date value
     * @type {Date|string}
     */
    get value() {
        if (typeof this._hiddenElement.value == 'string') {
            return new Date(this._hiddenElement.value + 'T00:00:00' + Date.getTimezoneString());
        }
        else if (this._hiddenElement.value instanceof Date) {
            return this._hiddenElement.value;
        }
        else {
            return null;
        }
    }

    /**
     * Format of date
     * @type {string}
     */
    get format() {
        return this._format;
    }

    /**
     * Format of date
     * @type {string}
     */
    set format(value) {
        this._format = value;
    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    get tabIndex() {
        return this._viewElement.attr('tabIndex');
    }
    /**
     * Tab index
     * @type {number|boolean}
     */
    set tabIndex(value) {
        this._viewElement.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
        this._hiddenElement.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

    /**
     * Has icon
     * @type {boolean}
     */
    get hasIcon() {
        return this._icon.shown;
    }
    /**
     * Has icon
     * @type {boolean}
     */
    set hasIcon(value) {
        this._icon.shown = value;
    }

    /**
     * Minimal date
     * @type {Date}
     */
    get min() {
        return this._min;
    }
    /**
     * Minimal date
     * @type {Date}
     */
    set min(value) {
        this._min = value;
    }

    /**
     * Maximal date
     * @type {Date}
     */
    get max() {
        return this._max;
    }
    /**
     * Maximal date
     * @type {Date}
     */
    set max(value) {
        this._max = value;
    }

    /**
     * Today date
     * @type {Date}
     */
    get todayDate() {
        return this._todayDate;
    }
    /**
     * Today date
     * @type {Date}
     */
    set todayDate(value) {
        this._todayDate = value;
    }

    /**
     * Today date title
     * @type {String}
     */
    get todayString() {
        return this._todayString;
    }
    /**
     * Today date title
     * @type {String}
     */
    set todayString(value) {
        this._todayString = value;
    }

}
