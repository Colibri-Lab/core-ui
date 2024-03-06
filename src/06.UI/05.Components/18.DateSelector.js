
Colibri.UI.DateSelector = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.create('div'));

        this.AddClass('app-date-selector-component');

        this._hiddenElement = Element.create('input', {type: 'date', class: 'ui-hidden', name: name});
        this._viewElement = Element.create('input', {type: 'text', name: name + '_view'});

        this._icon = new Colibri.UI.Icon('icon', this);
        this._icon.value = Colibri.UI.CalendarIcon;
        this._icon.shown = true;

        this._element.append(this._hiddenElement);
        this._element.append(this._viewElement);

        this._hiddenElement.addEventListener('click', (e) => {this.Dispatch('Clicked', { domEvent: e }); e.preventDefault(); e.stopPropagation(); return false;});
        this._hiddenElement.addEventListener('change', (e) => {
            this._showValue();
            this.Dispatch('Changed');
            e.preventDefault();
        });
        this._hiddenElement.addEventListener('blur', (e) => {
            if(!this._skipLooseFocus) {
                this._showValue();
                this.Dispatch('Changed');
                this.Close();
            }
        });
        // this._hiddenElement.addEventListener('keydown', (e) => {
        //     e.stopPropagation(); 
        // });

        this._viewElement.addEventListener('click', (e) => this.Dispatch('Clicked', { domEvent: e }));
        this._viewElement.addEventListener('dblclick', (e) => this.Dispatch('DoubleClicked', { domEvent: e }));
        this._viewElement.addEventListener('mousedown', (e) => this.Dispatch('MouseDown', { domEvent: e }));
        this._viewElement.addEventListener('mouseup', (e) => this.Dispatch('MouseUp', { domEvent: e }));
        this._viewElement.addEventListener('mousemove', (e) => this.Dispatch('MouseMove', { domEvent: e }));
        this._viewElement.addEventListener('keydown', (e) => this.Dispatch('KeyDown', { domEvent: e }));
        this._viewElement.addEventListener('keyup', (e) => this.Dispatch('KeyUp', { domEvent: e }));
        this._viewElement.addEventListener('keypress', (e) => this.Dispatch('KeyPressed', { domEvent: e }));
        this._viewElement.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', { domEvent: e }));
        this._viewElement.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', { domEvent: e }));
        this._hiddenElement.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', { domEvent: e }));
        this._hiddenElement.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', { domEvent: e }));

        let dateformat = App.DateFormat || 'ru-RU';
        this._format = new Intl.DateTimeFormat(dateformat, {day: '2-digit', month: 'short', year: 'numeric'});

        this.AddHandler('Clicked', (event, args) => {
            if(this.enabled) {
                this.Open();
            }
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });

        this.AddHandler('KeyDown', (event, args) => {
            if(['Escape', 'Enter', 'Space'].indexOf(args.domEvent.code) !== -1) {
                if(this.enabled) {                    
                    if(args.domEvent.code === 'Space') {
                        this.Open();
                    }
                    else if(args.domEvent.code === 'Escape') {
                        this.Close();
                    }
                    else if(args.domEvent.code === 'Enter') {
                        this.Close();
                    }
                }

                args.domEvent.stopPropagation();
                args.domEvent.preventDefault();
                return false;
            }
        });


    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Когда значение изменилось');
        this.RegisterEvent('PopupOpened', false, 'Попап открыт');
        this.RegisterEvent('PopupClosed', false, 'Попап закрыт');
    }

    _showValue() {

        try {
            this._viewElement.value = this._format.format(this.value);
        }
        catch(e) {
            this._viewElement.value = '';
        }    

        if(this._popup) {
            try {
                this._popup.value = this.value;
            }
            catch(e) {
                this._popup.value = new Date();
            }    
        }
    }

    Open() {
        if(!this._popup) {
            this._popup = new Colibri.UI.DateSelectorPopup('popup', document.body);
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

    Close() {
        
        this.ToggleView(false);
        if(this._popup) {
            this._popup.Dispose();
            this._popup = null;
        }
        this._viewElement.focus();

        this.Dispatch('PopupClosed', {});
    }

    Focus() {
        if(!this.enabled) {
            return;
        }
        this.ToggleView(true);
        this._hiddenElement.focus();
    }

    ToggleView(view) {

        if(!view) {
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

    set placeholder(value) {
        this._viewElement.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    get placeholder() {
        return this._viewElement.attr('placeholder');
    }

    set enabled(value) {
        this._viewElement.attr('disabled', value ? null: 'disabled');
    }

    get enabled() {
        return this._viewElement.attr('disabled') !== 'disabled';
    }

    set readonly(value) {
        this._viewElement.attr('readonly', value ? 'readonly' : null);
    }

    get readonly() {
        return this._viewElement.attr('readonly') !== 'readonly';
    }

    set value(value) {
        const oldValue = this._hiddenElement.value;
        if(!value) {
            this._hiddenElement.value = '';
        } else if(typeof value == 'string') {
            this._hiddenElement.value = value;
        } else if(value instanceof Date) {
            this._hiddenElement.value = value.toShortDateString();
        } else {
            this._hiddenElement.value = value && value?.date ? value?.date?.toDate()?.toShortDateString() : '';
        }
        this._showValue();
        if(oldValue != this._hiddenElement.value) {
            this.Dispatch('Changed');
        }
    }

    get value() {
        if(typeof this._hiddenElement.value == 'string') {
            return new Date(this._hiddenElement.value);
        }
        else if(this._hiddenElement.value instanceof Date) {
            return this._hiddenElement.value;
        }
        else {
            return null;
        }
    }

    get format() {
        return this._format;
    }

    set format(value) {
        this._format = value;
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._viewElement.attr('tabIndex');
    }
    set tabIndex(value) {
        this._viewElement.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
        this._hiddenElement.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

    get hasIcon() {
        return this._icon.shown;
    }
    set hasIcon(value) {
        this._icon.shown = value;
    }

}
Colibri.UI.DateSelectorPopup = class extends Colibri.UI.Pane {

    constructor(name, container) {
        super(name, container);

        this.AddClass('app-date-selector-popup-component');

        this.AddHandler('ShadowClicked', (event, args) => {
            this.parent.Close();
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
        });

        this._pickerheader = this._element.append(Element.fromHtml('<div class="calendar__dropdown-pickerheader"></div>'));
        this._pickerheader.append(Element.fromHtml('<table><tr><td class="left">' + Colibri.UI.ArrowLeft + '</td><td class="calendar__dropdown-pickerheader_title"></td><td class="right">' + Colibri.UI.ArrowRight + '</td></tr></table>'));
        this._headerText = this._element.querySelector('.calendar__dropdown-pickerheader_title');

        this._datePicker = new Colibri.UI.DatePicker('date-picker', this);
        this._monthPicker = new Colibri.UI.MonthPicker('month-picker', this);
        this._yearPicker = new Colibri.UI.YearPicker('year-picker', this);

        this._mode = 'datepicker';
        this._value = new Date();
        this._datePicker.value = this._value;
        this._yearPicker.value = this._value;
        this._monthPicker.value = this._value;

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', (event, args) => {
            if(!this.parent) {
                return;
            }

            const bounds = this.parent.container.bounds();
            const b = this.container.bounds(true, true);
            if(!args.state) {
                this.top =  bounds.top - b.outerHeight;
                this.AddClass('-up');
            }

        });

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

    set shown(value) {
        super.shown = value;
        this.container.hideShowProcess(() => {
            const bounds = this.parent.container.bounds(true, true);
            this.top = bounds.top + bounds.outerHeight;
            this.left = bounds.left;
            this.RemoveClass('-up');        
            if(value) {
                this.BringToFront();
                this._show();
            }
            else {
                this.SendToBack();
            }
            this.hasShadow = value;
            if(this.ContainsClass('-up')) {
                this.Dispatch('VisibilityChanged', {state: false});
            }    
        });
    }

    set mode(value) {
        this._mode = value;
    }

    get mode() {
        return this._mode;
    }

    get value() {

        let value = this._value;
        if(!value || value == 'Invalid Date') {
            value = Date.Now();
        }

        return value;
    }

    set value(value) {
        this._value = value.copy();
        this._show();
        this._datePicker.Render();
        this._yearPicker.Render();
        this._monthPicker.Render();
    }

    ToggleMode() {
        if (this.mode == 'datepicker') {
            this.mode = 'monthpicker';
        } else if (this.mode == 'monthpicker') {
            this.mode = 'yearpicker';
        }
        this._show();
    }

    ToggleModeBack() {
        if (this.mode == 'yearpicker') {
            this.mode = 'monthpicker';
        } else if (this.mode == 'monthpicker') {
            this.mode = 'datepicker';
        }
        this._show();
    }

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
        if(this.ContainsClass('-up')) {
            this.Dispatch('VisibilityChanged', {state: false});
        }
    }

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

Colibri.UI.DatePicker = class extends Colibri.UI.Pane {

    constructor(name, container) {
        super(name, container);

        this.AddClass('app-date-picker-component');

    }

    Render() {
        this._renderContent();
        this._bind();
    }

    _renderContent() {

        this._element.html('');
        let dateformat = App.DateFormat || 'ru-RU';
        const formatter = new Intl.DateTimeFormat(dateformat, { day: '2-digit' });
        const weekformatter = new Intl.DateTimeFormat(dateformat, { weekday: 'narrow' });

        const table = this._element.append(Element.fromHtml('<table cellspacing="2"><thead></thead><tbody></tbody><tfoot></tfoot></table>'));

        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        const tfoot = table.querySelector('tfoot');

        let tr = thead.append(Element.fromHtml('<tr></tr>'));

        let dt = this.parent.value.copy();
        let checkedDate = dt.copy();

        let today = new Date();

        let weekday = dt.getDay();
        if (weekday == 0) {
            weekday = 7;
        }

        dt.setTime(dt.getTime() - (weekday - 1) * 86400000);
        for (let i = 0; i < 7; i++) {
            tr.append(Element.fromHtml('<td>' + (weekformatter.format(dt)) + '</td>'));
            dt.setTime(dt.getTime() + 86400000);
        }

        dt = this.parent.value.copy();
        let day = dt.getDate();

        dt.setTime(dt.getTime() - day * 86400000);
        weekday = dt.getDay();

        // нашли начало календарика;
        dt.setTime(dt.getTime() - (weekday - 1) * 86400000);

        for (let i = 0; i < 6; i++) {
            // печатаем 6 строк
            tr = tbody.append(Element.fromHtml('<tr></tr>'));
            for (let i = 0; i < 7; i++) {
                // печатаем 7 дней
                let className = "";
                if (today.getDate() == dt.getDate() && today.getMonth() == dt.getMonth()) {
                    className += ' today';
                }
                if (checkedDate.getDate() == dt.getDate() && checkedDate.getMonth() == dt.getMonth()) {
                    className += ' current';
                }
                if (checkedDate.getMonth() != dt.getMonth()) {
                    className += ' ntm';
                }
                tr.append(Element.fromHtml('<td class="' + className + '" data-value="' + (dt.getTime()) + '">' + formatter.format(dt) + '</td>'));
                dt.setTime(dt.getTime() + 86400000);
            }
        }

        tfoot.append(Element.fromHtml('<td colspan="7" data-today="today" data-value="' + (today.getTime()) + '">#{ui-dateselector-today}</td>'));
    }

    _bind() {
        this._element.querySelectorAll('td').forEach((td) => {
            td.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('ntm')) {
                    return false;
                }
                this.parent.value = Date.from(e.target.dataset.value);
                this.parent.parent.value = Date.from(e.target.dataset.value);
                this.parent.parent.Close();
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        })
    }


}

Colibri.UI.MonthPicker = class extends Colibri.UI.Pane {

    constructor(name, container) {
        super(name, container);

        this.AddClass('app-month-picker-component');

    }

    Render() {
        this._renderContent();
        this._bind();
    }

    _renderContent() {

        this._element.html('');

        const format = { "month": "short" };
        let dateformat = App.DateFormat || 'ru-RU';
        const formatter = new Intl.DateTimeFormat(dateformat, format);

        const table = this._element.append(Element.fromHtml('<table cellspacing="2"><tbody></tbody><tfoot></tfoot></table>'));
        const tbody = table.querySelector('tbody');
        const tfoot = table.querySelector('tfoot');

        let dt = this.parent.value.copy();

        let checkedDate = dt.copy();
        let today = new Date();

        let currentMonth = today.getMonth() + 1;
        let checkedMonth = checkedDate.getMonth() + 1;

        for (let i = 0; i < 3; i++) {
            let tr = tbody.append(Element.fromHtml('<tr></tr>'));
            for (let month = i * 4 + 1; month <= i * 4 + 4; month++) {

                dt.setMonth(month - 1);

                let className = '';
                if (month == currentMonth) {
                    className = ' today';
                }
                if (month == checkedMonth) {
                    className = ' current';
                }

                tr.append(Element.fromHtml('<td class="' + className + '" data-value="' + (dt.getTime()) + '">' + formatter.format(dt).substring(0, 3) + '</td>'));
            }
        }

        tfoot.append(Element.fromHtml('<td colspan="7" data-today="today" data-value="' + (today.getTime()) + '">Сегодня</td>'));

    }

    _bind() {
        this._element.querySelectorAll('td').forEach((td) => {
            td.addEventListener('mousedown', (e) => {
                this.parent.value = Date.from(e.target.dataset.value);
                this.parent.parent.value = Date.from(e.target.dataset.value);
                this.parent.ToggleModeBack();
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        });
    }

}

Colibri.UI.YearPicker = class extends Colibri.UI.Pane {

    constructor(name, container) {
        super(name, container);

        this.AddClass('app-month-picker-component');

        this.Render();


    }

    Render() {
        this._renderContent();
        this._bind();
    }

    _renderContent() {

        this._element.html('');

        const format = { "year": "numeric" };
        let dateformat = App.DateFormat || 'ru-RU';
        const formatter = new Intl.DateTimeFormat(dateformat, format);

        const table = this._element.append(Element.fromHtml('<table cellspacing="2"><tbody></tbody><tfoot></tfoot></table>'));
        const tbody = table.querySelector('tbody');
        const tfoot = table.querySelector('tfoot');

        let dt = this.parent.value.copy();
        let checkedDate = dt.copy();
        let today = new Date();

        let currentYear = checkedDate.getFullYear();
        let todayYear = today.getFullYear();
        let yearStart = parseInt(currentYear / 10) * 10;

        for (let i = 0; i < 5; i++) {
            let tr = tbody.append(Element.fromHtml('<tr></tr>'));
            for (let year = yearStart + i * 2; year < yearStart + i * 2 + 2; year++) {

                dt.setFullYear(year);

                let className = '';
                if (year == todayYear) {
                    className = ' today';
                }
                if (year == currentYear) {
                    className = ' current';
                }

                tr.append(Element.fromHtml('<td class="' + className + '" data-value="' + (dt.getTime()) + '">' + formatter.format(dt) + '</td>'));
            }
        }

        tfoot.append(Element.fromHtml('<td colspan="7" data-today="today" data-value="' + (today.getTime()) + '">Сегодня</td>'));

    }

    _bind() {
        this._element.querySelectorAll('td').forEach((td) => {
            td.addEventListener('mousedown', (e) => {
                this.parent.value = Date.from(e.target.dataset.value);
                this.parent.parent.value = Date.from(e.target.dataset.value);
                this.parent.ToggleModeBack();
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        })
    }

    get startYear() {
        let dt = this.parent.value.copy()
        let currentYear = dt.getFullYear();
        return parseInt(currentYear / 10) * 10;
    }

}