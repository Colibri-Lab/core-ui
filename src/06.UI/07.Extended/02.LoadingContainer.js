/**
 * Loading box with progress bar
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const loadingContainer = new Colibri.UI.LoadingContainer('loadingContainer', this);
 * loadingContainer.shown = true;
 * loadingContainer.icon = Colibri.UI.LoadingIcon;
 * loadingContainer.progress = 50;
 * loadingContainer.progressColor = '#ff0000';
 * loadingContainer.progressWidth = 5;
 * loadingContainer.opacity = 0.5;
 * 
 * in html template
 * 
 * <LoadingContainer name="loadingContainer" shown="shown" icon="icon" progress="progress" progressColor="progressColor" progressWidth="progressWidth" opacity="opacity" />
 * 
 * then in js
 * 
 * const loadingContainer = this.Children('loadingContainer');
 * ```
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
     * Progress bar width
     * @type {Number}
     */
    get progressWidth() {
        return this._progress.width;
    }
    /**
     * Progress bar width
     * @type {Number}
     */
    set progressWidth(value) {
        this._progress.width = value;
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
     * @public
     */
    StartProgress(timer, speed) {
        this.BringToFront();
        this.Children('progress').Start(timer, speed);
    }

    /**
     * Pause timer
     * @public
     */
    PauseProgress() {
        this.BringToFront();
        this.Children('progress').Pause();
    }

    /**
     * Stop timer
     * @public
     */
    StopProgress(timer) {
        this.BringToFront();
        this.Children('progress').Stop();
    }

    /**
     * Show component
     * @public
     */
    Show() {
        super.Show();
        this.BringToFront();        
    }

}