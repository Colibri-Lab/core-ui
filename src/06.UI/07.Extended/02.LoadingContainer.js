/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.LoadingContainer = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.LoadingContainer']);
        this.AddClass('app-loading-container-component');
        
        this._loadingcontainer = this.Children('icon-container');
        this._progress = this.Children('progress');
    }

    /**
     * Loading icon
     * @type {String}
     */
    set icon(value) {
        this._loadingcontainer.value = value;
    }
    /**
     * Loading icon
     * @type {String}
     */
    get icon() {
        return this._loadingcontainer.value;
    }

    /**
     * Show icon
     * @type {boolean}
     */
    set shownIcon(value) {
        this._loadingcontainer.shown = value === 'true' || value === true;
    }
    /**
     * Show icon
     * @type {boolean}
     */
    get shownIcon() {
        return this._loadingcontainer.shown;
    }

    /**
     * Progress value
     * @type {number}
     */
    set progress(value) {
        this._progress.progress = value;
    }
    /**
     * Progress value
     * @type {number}
     */
    get progress() {
        return this._progress.progress;
    }

    /**
     * Progress bar color
     * @type {string}
     */
    set progressColor(value) {
        this._progress.color = value;
    }
    /**
     * Progress bar color
     * @type {string}
     */
    get progressColor() {
        return this._progress.color;
    }

    /**
     * Opacity
     * @type {number}
     */
    set opacity(value) {
        this._element.css('opacity', value)
    }

    /**
     * Opacity
     * @type {number}
     */
    get opacity() {
        return this._element.css('opacity');
    }

    /**
     * Start progress
     * @param {number} timer timer value
     * @param {number} speed speed
     */
    StartProgress(timer, speed) {
        this.BringToFront();
        this.Children('progress').Start(timer, speed);
    }

    /**
     * Pause timer
     */
    PauseProgress() {
        this.BringToFront();
        this.Children('progress').Pause();
    }

    /**
     * Stop timer
     */
    StopProgress(timer) {
        this.BringToFront();
        this.Children('progress').Stop();
    }

    /**
     * Show component
     */
    Show() {
        super.Show();
        this.BringToFront();        
    }

}