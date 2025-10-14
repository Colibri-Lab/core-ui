/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.DateTimeSelector = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));

        this.AddClass('app-date-selector-component');

        this._hiddenElement = Element.create('input', { type: 'datetime-local', class: 'ui-hidden', name: name });
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

        this._hiddenElement.addEventListener('click', (e) => { this.Dispatch('Clicked', { domEvent: e }); e.preventDefault(); e.stopPropagation(); return false; });
        this._hiddenElement.addEventListener('change', (e) => {
            let changed = false;
            if(this._value != this._hiddenElement.value) {
                changed = true;
            } 
            this._showValue();
            if(changed) {
                if (this._changeTimeout) {
                    clearTimeout(this._changeTimeout);
                    this._changeTimeout = -1;
                }
                this._changeTimeout = setTimeout(() => {
                    this.Dispatch('Changed', {component: this});
                }, 500);
            }

            e.preventDefault();
        });
        this._hiddenElement.addEventListener('blur', (e) => {
            // debugger;
            // if (!this._skipLooseFocus) {
            //     if (this.value < this._min) {
            //         this.value = this._min;
            //     } else if (this.value > this._max) {
            //         this.value = this._max;
            //     }
            //     this._showValue();
            //     this.Dispatch('Changed');
            //     this.Close();
            // }
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
        this._viewElement.addEventListener('keydown', nullhandler);
        this._viewElement.addEventListener('keyup', nullhandler);
        this._viewElement.addEventListener('keypress', nullhandler);

        this._hiddenElement.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', { domEvent: e }));
        this._hiddenElement.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', { domEvent: e }));


        let dateformat = App.DateFormat || 'ru-RU';
        this._format = new Intl.DateTimeFormat(dateformat, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        this.AddHandler('Clicked', this.__thisClicked);
        this.AddHandler('KeyDown', this.__thisKeyDown);


    }

    __thisClicked(event, args) {
        if (this.enabled) {
            this.Open();
        }
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

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


    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When value is changed');
        this.RegisterEvent('Cleared', false, 'When clear icon clicked');
        this.RegisterEvent('PopupOpened', false, 'When popup is opened');
        this.RegisterEvent('PopupClosed', false, 'When popup is closed');
    }

    __clearIconClicked(event, args) {
        this.value = '';
        this.Dispatch('Cleared');
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

    /** @private */
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
     */
    Open() {
        if (!this._popup) {
            this._popup = new Colibri.UI.DateTimeSelectorPopup('popup', document.body);
            this._popup.parent = this;
            const el = this.container.closest('[namespace]');
            el && this._popup.container.attr('namespace', el.attr('namespace'));
        }
        this._popup.mode = 'datepicker';
        this._popup.shown = true;
        this._popup.value = this.value;
        this._showValue();
        this.ToggleView(true);
        this._hiddenElement.focus();
        this.Dispatch('PopupOpened', {});

    }

    /**
     * Close selector
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
            this._hiddenElement.value = value.toDbDate();
        } else {
            this._hiddenElement.value = value && value?.date ? value?.date?.toDate()?.toDbDate() : '';
        }
        this._showValue();
        if (oldValue != this._hiddenElement.value) {
            this.Dispatch('Changed', {component: this});
        }
    }
    
    /**
     * Date value
     * @type {Date|string}
     */
    get value() {
        if (typeof this._hiddenElement.value == 'string') {
            return new Date(this._hiddenElement.value);
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

/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.DateTimeSelectorPopup = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);

        this.AddClass('app-date-selector-popup-component');

        this.AddHandler('ShadowClicked', this.__thisShadowClicked);

        this._pickerheader = this._element.append(Element.fromHtml('<div class="calendar__dropdown-pickerheader"></div>'));
        this._pickerheader.append(Element.fromHtml('<table><tr><td class="left">' + Colibri.UI.ArrowLeft + '</td><td class="calendar__dropdown-pickerheader_title"></td><td class="right">' + Colibri.UI.ArrowRight + '</td></tr></table>'));
        this._headerText = this._element.querySelector('.calendar__dropdown-pickerheader_title');

        this._datePicker = new Colibri.UI.DatePicker('date-picker', this);
        this._monthPicker = new Colibri.UI.MonthPicker('month-picker', this);
        this._yearPicker = new Colibri.UI.YearPicker('year-picker', this);

        this._timePicker = new Colibri.UI.Input('time-picker', this);
        this._timePicker.placeholder = 'Время';
        this._timePicker.shown = true;
        this._timePicker.hasIcon = false;
        this._timePicker.hasClearIcon = false;
        this._timePicker.mask = '99:99:99';
        this._timePicker.changeOnKeyUp = true;
        this._timePicker.changeOnKeyUpTimeout = 0;
        this._timePicker.AddHandler('Changed', (event, args) => {
            let dt = this.value.copy();
            let parts = this._timePicker.value.split(':');
            dt.setHours(parts[0]);
            dt.setMinutes(parts[1]);
            dt.setSeconds(parts[2]);
            this.value = dt.copy();

            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });

        this._mode = 'datepicker';
        this._value = new Date();
        this._datePicker.value = this._value;
        this._yearPicker.value = this._value;
        this._monthPicker.value = this._value;

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', this.__thisVisibilityChanged);

        this._headerText.addEventListener('mousedown', (e) => {
            this.parent._skipLooseFocus = true;
        });
        this._headerText.addEventListener('click', (e) => {
            this.parent._skipLooseFocus = false;
            this.ToggleMode();
            e.stopPropagation();
            e.preventDefault();
            return false;
        });

        this._element.querySelector('.left').addEventListener('mousedown', (e) => {
            this.parent._skipLooseFocus = true;
        });
        this._element.querySelector('.left').addEventListener('click', (e) => {
            this.parent._skipLooseFocus = false;
            let dt = this.value.copy();

            if (this.mode == 'datepicker') {
                // передергиваем на месяц в назад
                dt.setMonth(dt.getMonth() - 1);
            } else if (this.mode == 'monthpicker') {
                // передергиваем на год назад
                dt.setFullYear(dt.getFullYear() - 1);
            } else if (this.mode == 'yearpicker') {
                // передергиваем на 10 лет назад
                dt.setFullYear(dt.getFullYear() - 10);
            }
            this.value = dt.copy();

            e.stopPropagation();
            e.preventDefault();
            return false;

        });

        this._element.querySelector('.right').addEventListener('mousedown', (e) => {
            this.parent._skipLooseFocus = true;
        });
        this._element.querySelector('.right').addEventListener('click', (e) => {
            this.parent._skipLooseFocus = false;
            let dt = this.value.copy();
            if (this.mode == 'datepicker') {
                // передергиваем на месяц вперед
                dt.setMonth(dt.getMonth() + 1);
            } else if (this.mode == 'monthpicker') {
                // передергиваем на год вперед
                dt.setFullYear(dt.getFullYear() + 1);
            } else if (this.mode == 'yearpicker') {
                // передергиваем на 10 лет вперед
                dt.setFullYear(dt.getFullYear() + 10);
            }

            this.value = dt.copy();

            e.stopPropagation();
            e.preventDefault();
            return false;

        });

        this._element.addEventListener('mousewheel', (e) => {

            if (e.deltaY < 0) {
                this._element.querySelector('.left').emitMouseEvent('click');
            } else if (e.deltaY > 0) {
                this._element.querySelector('.right').emitMouseEvent('click');
            }

            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        this._show();

    }

    __thisShadowClicked(event, args) {
        this.parent.Close();
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
    }

    __thisVisibilityChanged(event, args) {
        

        if (!args.state) {
            Colibri.Common.Delay(50).then(() => {
                if (!this.parent) {
                    return;
                }

                try {
                    const bounds = this.parent.container.bounds();
                    const b = this.container.bounds(true, true);
    
                    if(b.top + b.outerHeight > window.innerHeight) {
                        this.top = bounds.top - b.outerHeight;
                        this.AddClass('-up');
                    }
                    if(b.left + b.outerWidth > window.innerWidth) {
                        this.left = bounds.left - b.outerWidth + bounds.outerWidth;
                    }
                } catch(e) {}
            });
        }

    }

    /**
     * Show/Hide
     * @type {boolean}
     */
    set shown(value) {
        super.shown = value;
        this.container.hideShowProcess(() => {
            const bounds = this.parent.container.bounds(true, true);
            this.top = bounds.top + bounds.outerHeight;
            this.left = bounds.left;
            this.RemoveClass('-up');
            if (value) {
                this.BringToFront();
                this._show();
            }
            else {
                this.SendToBack();
            }
            this.hasShadow = value;
            if (this.ContainsClass('-up')) {
                this.Dispatch('VisibilityChanged', { state: false });
            }
        });
    }
    /**
     * Show/Hide
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }

    /**
     * Mode
     * @type {datepicker,monthpicker,yearpicker}
     */
    set mode(value) {
        this._mode = value;
    }

    /**
     * Mode
     * @type {datepicker,monthpicker,yearpicker}
     */
    get mode() {
        return this._mode;
    }

    /**
     * Date value
     * @type {Date}
     */
    get value() {

        let value = this._value;
        if (!value || value == 'Invalid Date') {
            value = Date.Now();
        }

        return value;
    }

    /**
     * Date value
     * @type {Date}
     */
    set value(value) {
        if(value.toDbDate() == this.value.toDbDate()) {
            return;
        }
        this._value = value.copy();
        this._show();
        this._datePicker.Render();
        this._yearPicker.Render();
        this._monthPicker.Render();
        this._timePicker.value = this._value.toTimeString();
        if(this.parent.value.toDbDate() != this.value.toDbDate()) {
            this.parent.value = this.value;
        }
    }

    /**
     * Toggle mode
     */
    ToggleMode() {
        if (this.mode == 'datepicker') {
            this.mode = 'monthpicker';
        } else if (this.mode == 'monthpicker') {
            this.mode = 'yearpicker';
        }
        this._show();
    }

    /**
     * Toggle mode to back
     */
    ToggleModeBack() {
        if (this.mode == 'yearpicker') {
            this.mode = 'monthpicker';
        } else if (this.mode == 'monthpicker') {
            this.mode = 'datepicker';
        }
        this._show();
    }

    /**
     * Show selected mode
     * @private
     */
    _show() {
        if (this.mode == 'datepicker') {
            this._datePicker.shown = true;
            this._yearPicker.shown = false;
            this._monthPicker.shown = false;
        } else if (this.mode == 'monthpicker') {
            this._datePicker.shown = false;
            this._monthPicker.shown = true;
            this._yearPicker.shown = false;
        } else if (this.mode == 'yearpicker') {
            this._datePicker.shown = false;
            this._monthPicker.shown = false;
            this._yearPicker.shown = true;
        }
        this._showPickerTitle();
        if (this.ContainsClass('-up')) {
            this.Dispatch('VisibilityChanged', { state: false });
        }
    }

    /** @private */
    _showPickerTitle() {

        let value = this.value.copy();
        let dateformat = App.DateFormat || 'ru-RU';
        if (this.mode == 'datepicker') {
            const formatter = Intl.DateTimeFormat(dateformat, { month: 'long', year: 'numeric' });
            this._headerText.html(formatter.format(value).replaceAll('г.', ''));
        } else if (this.mode == 'monthpicker') {
            const formatter = Intl.DateTimeFormat(dateformat, { year: 'numeric' });
            this._headerText.html(formatter.format(value));
        } else if (this.mode == 'yearpicker') {
            this._headerText.html(this._yearPicker.startYear + '&nbsp;&ndash;&nbsp;' + (this._yearPicker.startYear + 10));
        }

    }

}
