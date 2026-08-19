/**
 * Notice class
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.Notice = class {

    /** 
     * Error message
     * @const {string}
     */
    static Error = 'error';
    /** 
     * Success message
     * @const {string}
     */
    static Success = 'success';
    /** 
     * Warning message
     * @const {string}
     */
    static Warning = 'warning';
    /** 
     * White message
     * @const {string}
     */
    static White = 'white';

    /** 
     * Permanent notice
     * @const {number}
     */
    static Permanent = 0;

    /** 
     * @private
     * @type {object}
     */
    _exception = null;

    /**
     * @constructor
     * @param {string|object} title title of message
     * @param {string} severity message severity
     * @param {number} timeout timeout to hide
     */
    constructor(title, severity = Colibri.UI.Notice.Error, timeout = 3000) {
        if(Object.isObject(title) && !!title.code && !!title.message) {
            // error object
            this._exception = title;
            title = this._exception.message;
        }
        this._title = title.message ?? title;
        this._severity = severity;
        this._timeout = timeout;
    }

    /**
     * Message title
     * @type {string}
     */
    get title() {
        return this._title;
    }

    /**
     * Message severity
     * @type {string}
     */
    get severity() {
        return this._severity;
    }

    /**
     * Timeout for hide
     * @type {number}
     */
    get timeout() {
        return this._timeout;
    }

    /**
     * Class name
     * @type {string}
     */
    get className() {
        return 'app-notice-' + this.severity + '-component';
    }

}