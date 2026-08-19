/**
 * DateTimeSelector popup component
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


        this._pickerheader = this._element.append(Element.fromHtml('<div class="calendar__dropdown-pickerheader"></div>'));
        this._pickerheader.append(Element.fromHtml('<table><tr><td class="left">' + Colibri.UI.ArrowLeft + '</td><td class="calendar__dropdown-pickerheader_title"></td><td class="right">' + Colibri.UI.ArrowRight + '</td></tr></table>'));
        this._headerText = this._element.querySelector('.calendar__dropdown-pickerheader_title');

        this._datePicker = new Colibri.UI.DatePicker('date-picker', this);
        this._monthPicker = new Colibri.UI.MonthPicker('month-picker', this);
        this._yearPicker = new Colibri.UI.YearPicker('year-picker', this);

        this._timeViewer = new Colibri.UI.DateTimeViewer('time-viewer', this);
        this._timeViewer.format = new Intl.DateTimeFormat(App.DateFormat || 'ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit'})
        this._timeViewer.shown = true;

        this._timePicker = new Colibri.UI.SingleTimeline('time-picker', this);
        this._timePicker.shown = true;
        this._timePicker.hasDateComponents = false;
        this._timePicker.maxLength = 24 * 60 * 60 - 1;
        this._timePicker.AddHandler('MouseDown', (event, args) => {
            this.parent._skipLooseFocus = true;
        });
        this._timePicker.AddHandler('DateMayChangeTo', (event, args) => {
            this._timeViewer.value = args.value;
        });
        this._timePicker.AddHandler('Changed', (event, args) => {
            const dt = this.value;
            dt.setSeconds(this._timePicker.value.getSeconds());
            dt.setMinutes(this._timePicker.value.getMinutes());
            dt.setHours(this._timePicker.value.getHours());
            this.parent.value = dt.copy();
            return false;
        });

        this._mode = 'datepicker';
        this._value = new Date();
        this._timePicker.max = this._value.copy().setAsEndOfDay();
        this._datePicker.value = this._value;
        this._yearPicker.value = this._value;
        this._monthPicker.value = this._value;
        this._timePicker.value = this._value;
        this._timeViewer.value = this._value;

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

        this.AddHandler('ShadowClicked', this.__thisShadowClicked);

        this._show();

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisShadowClicked(event, args) {
        this.parent.Close();
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
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
        this._timePicker.max = this._value.copy().setAsEndOfDay();
        this._timePicker.value = this._value;
        this._timeViewer.value = this._value;
        if(this.parent.value.toDbDate() != this.value.toDbDate()) {
            this.parent.value = this.value;
        }
    }

    /**
     * Toggle mode
     * @public
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
     * @public
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
     * @ignore
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
        
        // console.log(this._value, this._timePicker.min, this._timePicker.max)
        this._showPickerTitle();
        if (this.ContainsClass('-up')) {
            this.Dispatch('VisibilityChanged', { state: false });
        }
    }

    /** 
     * @ignore
     * @private 
     */
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

    /**
     * Gets the focused element
     * @type {Colibri.UI.Component}
     */
    get focusedElement() {
        return this._focusedElement;
    }

}
