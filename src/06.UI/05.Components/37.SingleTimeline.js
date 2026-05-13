/**
 * Timeline
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.SingleTimeline = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('div'));
        this.AddClass('colibri-ui-singletimeline');

        this._disableChangeEvent = false;
        this._render();

        this._viewPicker();
        this._showProgress();
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When the values are changed');
        this.RegisterEvent('MinChanged', false, 'When the min value is changed');
        this.RegisterEvent('MaxChanged', false, 'When the max value is changed');
        this.RegisterEvent('ProgressClicked', false, 'When the progress is clicked');
        this.RegisterEvent('StepChanged', false, 'When the step value is changed');
    }

    _render() {

        this._inputFlex = new Colibri.UI.FlexBox('inputflex', this);

        this._input = new Colibri.UI.DateTimeSelector('input', this._inputFlex);
        
        this._select = new Colibri.UI.Selector('select', this._inputFlex);
        this._select.readonly = false;
        this._select.searchable = false;

        this._minText = new Colibri.UI.TextSpan('min-text', this._inputFlex);
        this._min = new Colibri.UI.DateTimeSelector('min', this._inputFlex);
        this._maxText = new Colibri.UI.TextSpan('max-text', this._inputFlex);
        this._max = new Colibri.UI.DateTimeSelector('max', this._inputFlex);

        this._pane = new Colibri.UI.Pane('pane', this);

        this._progress = new Colibri.UI.Pane('progress', this._pane);
        this._span = new Colibri.UI.Pane('span', this._progress);

        this._inputFlex.shown = this._input.shown =
            this._pane.shown = this._progress.shown = this._span.shown =
            this._max.shown = this._min.shown = this._minText.shown = 
            this._maxText.shown = this._select.shown = true;

        this._input.hasIcon = this._min.hasIcon = this._max.hasIcon = false;
        this._input.hasClearIcon = this._min.hasClearIcon = this._max.hasClearIcon = false;

        let dateformat = App.DateFormat || 'ru-RU';
        this._input.format = this._min.format = this._max.format =
            new Intl.DateTimeFormat(dateformat, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

        this._select.AddHandler('Changed', this.__selectChanged, false, this);

        this._drag = new Colibri.UI.Drag(this._span.container, this._pane.container, (newLeft, newTop) => this._spanMoved(newLeft, newTop));
        this._addHandlers();

    }

    _addHandlers() {
        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', this.__visibilityChanged);
        this._input.AddHandler('ReceiveFocus', this.__inputReceiveFocus, false, this);
        this._input.AddHandler(['LoosedFocus', 'Changed'], this.__inputLoosedFocus, false, this);
        this._min.RemoveHandler('Changed', this.__minChanged, this);
        this._min.AddHandler('Changed', this.__minChanged, false, this);
        this._max.RemoveHandler('Changed', this.__maxChanged, this);
        this._max.AddHandler('Changed', this.__maxChanged, false, this);
        this._pane.AddHandler('Clicked', this.__progressClicked, false, this);
        this.handleWheel = true;
        this.AddHandler('MouseWheel', this.__thisMouseWheel);
    }

    __thisMouseWheel(event, args) {
        const step = ((this._select?.value?.value ?? this._select?.value) * 1000);
        if(args.domEvent.deltaY > 0) {
            this.value = new Date(this.value.getTime() - step);
        } else {
            this.value = new Date(this.value.getTime() + step);
        }
        this.Dispatch('Changed', { value: this.value });
    }

    __progressClicked(event, args) {
        if(args.domEvent.target.matches('[data-object-name="pane"]')) {
            const left = args.domEvent.offsetX;
            const top = args.domEvent.offsetY;
            this._spanMoved(left, null);
            this.Dispatch('ProgressClicked', Object.assign(args, { value: this.value }));
        }
    }

    __minChanged(event, args) {
        if (!this._disableChangeEvent) {
            this._disableChangeEvent = true;
            this.Dispatch('MinChanged', { min: this._min.value, max: this._max.value });
            this._disableChangeEvent = false;
        }
    }

    __maxChanged(event, args) {
        if (!this._disableChangeEvent) {
            this._disableChangeEvent = true;
            this.Dispatch('MaxChanged', { min: this._min.value, max: this._max.value });
            this._disableChangeEvent = false;
        }
    }


    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __inputReceiveFocus(event, args) {
        this._input.value = this._value;
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __inputLoosedFocus(event, args) {
        if (this._disableChangeEvent) {
            return;
        }
        this.value = this._input.value;
        this._showProgress();
        this.Dispatch('Changed', { value: this.value });
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __visibilityChanged(event, args) {
        this._showProgress();
    }

    _spanMoved(newLeft, newTop) {
        // this._progress.container.css('left', newLeft + 'px');
        this._calculateValue(newLeft, null);
        this._showProgress();
        this.Dispatch('Changed', { value: this.value });
    }

    _setPoint(left) {
        const width = this._pane.width;
        const perc = (left) * 100 / width;
        const max = this._maxValue.toUnixTime();
        const min = this._minValue.toUnixTime();

        let newValue = min + ((max - min) * perc / 100);
        if (newValue >= max) {
            newValue = max;
        }
        if (newValue <= min) {
            newValue = min;
        }
        this.value = newValue.toDateFromUnixTime();

    }


    _calculateValue(left) {
        if (left !== null) {
            this._setPoint(left);
        }
    }

    _showProgress() {
        try {

            let value = this._value;

            const width = parseFloat(this._pane.width);

            const max = parseFloat(this._maxValue.toUnixTime());
            const min = parseFloat(this._minValue.toUnixTime());

            let left = width * (parseFloat(value.toUnixTime()) - min) * 100 / (max - min) / 100;
            if (left > width) {
                left = width;
            }

            this._progress.container.css('left', left.toFixed(4) + 'px');

        } catch (e) {

        }

    }

    _viewPicker() {

        this._maxText.value = '#{ui-components-timeline-max}: ';
        this._max.value = this._maxValue;
        this._minText.value = '#{ui-components-timeline-min}: ';
        this._min.value = this._minValue;

    }

    /**
     * Показать/не показывать
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }
    /**
     * Показать/не показывать
     * @type {boolean}
     */
    set shown(value) {
        value = this._convertProperty('Boolean', value);
        super.shown = value;
        Colibri.Common.Delay(100).then(() => {
            this._showProgress();
        })
    }

    /**
     * 
     * @type {Date}
     */
    get value() {
        return this._value;
    }
    /**
     * 
     * @type {Date}
     */
    set value(value) {
        value = this._convertProperty('Date', value);
        this._value = value;

        const max = this._maxValue;
        const min = this._minValue;

        if (!value) {
            value = new Date((max.getTime() + min.getTime()) / 2);
        } else if (!(value instanceof Date)) {
            value = value.toDate();
        }

        let left = value;
        if (left >= max) {
            left = max;
        }
        if (left <= min || left == 'Invalid Date') {
            left = min;
        }

        this._value = left;
        this._showValue();
    }
    _showValue() {
        const max = this._maxValue;
        const min = this._minValue;

        if (this._value === null) {
            this._value = new Date((max.getTime() + min.getTime()) / 2);
        }

        this._disableChangeEvent = true;
        this._input.value = this._value;
        this._disableChangeEvent = false;
        this._showProgress();

    }

    /**
     * Табуляция
     * @type {number}
     */
    get tabIndex() {
        return this._input.tabIndex;
    }
    /**
     * Табуляция
     * @type {number}
     */
    set tabIndex(value) {
        this._input.tabIndex = value;
    }


    _formatDate(v) {
        if (!v) {
            return '';
        }
        return (v instanceof Date ? v : v.toDate())?.intlFormat(true, false, false, true) ?? '';
    }

    /**
     * Maximum number of picker
     * @type {Date}
     */
    get max() {
        return this._maxValue;
    }
    /**
     * Maximum number of picker
     * @type {Date}
     */
    set max(value) {
        value = this._convertProperty('Date', value);
        if (!this._maxValue || this._maxValue.getTime() != value.getTime()) {
            this._maxValue = value;

            if(this._maxLength) {
                this._minValue = (this._maxValue.toUnixTime() - this._maxLength).toDateFromUnixTime();
            }

            this._viewPicker();
            this._showProgress();
        }
    }

    /**
     * Minimum value of picker
     * @type {Date}
     */
    get min() {
        return this._minValue;
    }
    /**
     * Minimum value of picker
     * @type {Date}
     */
    set min(value) {
        if(this._maxLength) {
            throw new Error('Cannot set min value when maxLength is set');
        }

        value = this._convertProperty('Date', value);
        if (!this._minValue || value.getTime() != this._minValue.getTime()) {
            this._minValue = value;

            this._viewPicker();
            this._showProgress();
        }
    }

    /**
     * Set the min or length
     * @type {Number}
     */
    set maxLength(value) {
        this._maxLength = this._convertProperty('Number', value);
        this._minValue = null;
        this._viewPicker();
        this._showProgress();
        this._min.enabled = !this._maxLength;
    }

    /**
     * Set the min or length
     * @type {Number}
     */
    get maxLength() {
        return this._maxLength
    }

    Expand(min, max) {
        if (!(min instanceof Date)) {
            min = min.toDate();
        }
        if (!(max instanceof Date)) {
            max = max.toDate();
        }
        this._disableChangeEvent = true;
        this._minValue = min;
        this._maxValue = max;
        this._value = new Date((max.getTime() + min.getTime()) / 2);

        this._viewPicker();
        this._showProgress();
        this._disableChangeEvent = false;
    }

    Play() {
        this._state = 'play';
        Colibri.Common.StartTimer('ldi-timeline-timer', 1000, () => {
            const step = ((this._select?.value?.value ?? this._select?.value) * 1000);
            this.max = new Date(this.max.getTime() + step);
            if(this.max.getTime() > Date.Now().getTime()) {
                this.max = new Date();
            }
            this.value = new Date(this.value.getTime() + step);
            if(this.value.getTime() > Date.Now().getTime()) {
                this.value = new Date();
            }
            this.Dispatch('Changed', { value: this.value });
        });
    }

    Pause() {
        this._state = 'pause';
        Colibri.Common.StopTimer('ldi-timeline-timer');
    }

    /**
     * Steps array <{value, title},...>
     * @type {Array}
     */
    get steps() {
        return this._steps;
    }
    /**
     * Steps array <{value, title},...>
     * @type {Array}
     */
    set steps(value) {
        value = this._convertProperty('Array', value);
        this._steps = value;
        this._showSteps();
    }
    _showSteps() {
        this._select.values = this._steps;
    }

    /**
     * Step seconds
     * @type {Number}
     */
    get step() {
        return (this._select?.value?.value ?? this._select?.value);
    }
    /**
     * Step seconds
     * @type {Number}
     */
    set step(value) {
        value = this._convertProperty('Number', value);
        this._select.value = value;
    }

    __selectChanged(event, args) {
        if(this._state === 'play') {
            this.Pause();
            this.Play();
        }
        this.Dispatch('StepChanged', { value: this.step });
    }

}