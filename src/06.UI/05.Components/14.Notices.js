/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Notices = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-notices-component');

        this._list = new Colibri.UI.List('list', this);
        this._list.shown = true;
        this._group = this._list.AddGroup('group', '');
    }

    /**
     * Add the notice
     * @param {Colibri.UI.Notice} noticeData notice data 
     * @returns {Colibri.UI.Notice}
     */
    Add(noticeData) {

        if(!noticeData.title) {
            return;
        }

        this.shown = true;
        this.BringToFront();

        if(noticeData.severity === Colibri.UI.Notice.Error) {
            console.log(noticeData);
            console.trace();
            debugger;
        }

        const notice = this._group.AddItem(noticeData);
        
        const removeNotice = () => {
            if(!notice.isConnected) {
                return;
            }
            notice.RemoveClass(noticeData.className);
            Colibri.Common.Delay(300).then(() => {
                if(!notice.isConnected) {
                    return Promise.resolve();
                }
                notice.height = 0;
                return Colibri.Common.Delay(100);
            }).then(() => {
                if(!notice.isConnected) {
                    return;
                }
                notice.Dispose();
                if(this._group.children == 0) {
                    this.shown = false;
                }
            });
        };

        Colibri.Common.Delay(10).then(() => {
            if(!notice.isConnected) {
                return;
            }

            notice.AddClass(noticeData.className);

            const icon = new Colibri.UI.Icon('icon', notice);
            icon.shown = true;
            icon.value = Colibri.UI.CloseIcon;
            icon.AddClass('app-notice-icon-component');
            icon.AddHandler('Clicked', removeNotice);
            notice.AddHandler('Clicked', removeNotice);

            if(noticeData.timeout > 0) {
                Colibri.Common.Delay(noticeData.timeout).then(removeNotice);
            }
            
        });
        
        // if(!App.Device.isWeb && App.Device.isInBackgroundMode) {
        //     const titleparts = noticeData.title.split('<br />');
        //     App.Device.Notifications.Schedule(
        //         titleparts.length > 1 ? titleparts[0] : 'Error', 
        //         titleparts.length > 0 ? titleparts[1] : titleparts[0], 
        //         null, {type: 'calendar', at: new Date().getTime() + 2000}
        //     );
        //     App.Device.Dialogs.Beep(1);
        //     App.Device.Vibrate.Vibrate(1000);
        // }

        return notice; 

        
        
    }

}

/**
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.Notice = class {

    /** Error message */
    static Error = 'error';
    /** Success message */
    static Success = 'success';
    /** Warning message */
    static Warning = 'warning';
    /** White message */
    static White = 'white';

    /** Permanent notice */
    static Permanent = 0;

    /** @type {object} */
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
     * @readonly
     */
    get title() {
        return this._title;
    }

    /**
     * Message severity
     * @type {string}
     * @readonly
     */
    get severity() {
        return this._severity;
    }

    /**
     * Timeout for hide
     * @type {number}
     * @readonly
     */
    get timeout() {
        return this._timeout;
    }

    /**
     * Class name
     * @type {string}
     * @readonly
     */
    get className() {
        return 'app-notice-' + this.severity + '-component';
    }

}