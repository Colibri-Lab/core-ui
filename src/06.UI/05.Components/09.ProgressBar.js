/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.ProgressBar = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */    
    constructor(name, container) {
        super(name, container, Element.fromHtml('<div><div class="app-progress-bar-container-component"><div class="app-progress-bar-progress-component"></div></div></div>')[0]);
        this.AddClass('app-progress-bar-component');

        // Интервал
        this._intervalId = -1;

        this._progress = this._element.querySelector('.app-progress-bar-progress-component');
        this._progress.style.width = '0%';
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ProgressIsZero', false, 'Поднимается когда прогресс равен 0');
        this.RegisterEvent('ProgressLessFifty', false, 'Поднимается когда прогресс меньше 50');
        this.RegisterEvent('ProgressOverFifty', false, 'Поднимается когда прогресс больше 50');
        this.RegisterEvent('ProgressIsOneHundred', false, 'Поднимается когда прогресс равен 100');
        this.RegisterEvent('ProgressChanged', false, 'Поднимается когда прогресс изменился');
    }

    /**
     * Progress value
     * @type {number}
     */
    get progress() {
        return parseInt(this._progress.style.width);
    }

    /**
     * Progress value
     * @type {number}
     */
    set progress(value) {
        this._progress.style.width = value + '%';

        if (value === 0) {
            this.Dispatch('ProgressIsZero', {value: value});
        }

        if (value < 50) {
            this.Dispatch('ProgressLessFifty', {value: value});
        }

        if (value >= 50) {
            this.Dispatch('ProgressOverFifty', {value: value});
        }

        if (value === 100) {
            this.Dispatch('ProgressIsOneHundred', {value: value});
        }

        this.Dispatch('ProgressChanged', {value: value});
    }

    /**
     * Color of progress bar
     * @type {string}
     */
    get color() {
        return this._progress.css('background');
    }
    /**
     * Color of progress bar
     * @type {string}
     */
    set color(value) {
        this._progress.css('background', value);
    }

    /**
     * Starts a timer
     * @param {number} timer timer of progress bar
     * @param {number} speed speed
     */
    Start(timer, speed) {
        this._progressiveIterator = 100;
        if(this._intervalId != -1) {
            this.Pause();
        }
        this._intervalId = setInterval(() => {
            this.progress += (100 - this.progress) / this._progressiveIterator;
            this._progressiveIterator = this._progressiveIterator / speed;
            if(this.progress > 99) {
                this.Stop();
            }
        }, timer);
    }

    /**
     * Pauses the timer
     */
    Pause() {
        clearInterval(this._intervalId);
        this._intervalId = -1;
    }

    /**
     * Stop the timer
     */
    Stop() {
        this.progress = 100;
        clearInterval(this._intervalId);
        this._intervalId = -1;
    }

}