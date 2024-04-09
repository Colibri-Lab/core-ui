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
     * Добавить сообщение
     * @param {Colibri.UI.Notice} noticeData сообщение 
     * @returns {Colibri.UI.Notice}
     */
    Add(noticeData) {

        if(!noticeData.title) {
            return;
        }

        console.log(noticeData); 

        this.shown = true;
        this.BringToFront();

        if(noticeData.severity === Colibri.UI.Notice.Error) {
            console.log(noticeData);
            console.trace();
            debugger;
        }
        const notice = this._group.AddItem(noticeData);
        
        const removeNotice = () => {
            notice.RemoveClass(noticeData.className);
            Colibri.Common.Delay(300).then(() => {
                notice.height = 0;
                return Colibri.Common.Delay(100);
            }).then(() => {
                notice.Dispose();
                if(this._group.children == 0) {
                    this.shown = false;
                }
            });
        };

        Colibri.Common.Delay(10).then(() => {

            notice.AddClass(noticeData.className);

            const icon = new Colibri.UI.Icon('icon', notice);
            icon.shown = true;
            icon.value = Colibri.UI.CloseIcon;
            icon.AddClass('app-notice-icon-component');
            icon.AddHandler('Clicked', removeNotice);
            notice.AddHandler('Clicked', removeNotice);

            Colibri.Common.Delay(noticeData.timeout).then(removeNotice);
            
        });
        return notice;
    }

}

Colibri.UI.Notice = class {

    static Error = 'error';
    static Success = 'success';
    static Warning = 'warning';
    static White = 'white';

    _exception = null;

    constructor(title, severity = Colibri.UI.Notice.Error, timeout = 3000) {
        if(typeof title === 'object' && !!title.code && !!title.message) {
            // error object
            this._exception = title;
            title = this._exception.message;
        }
        this._title = title;
        this._severity = severity;
        this._timeout = timeout;
    }

    get title() {
        return this._title;
    }

    get severity() {
        return this._severity;
    }

    get timeout() {
        return this._timeout;
    }

    get className() {
        return 'app-notice-' + this.severity + '-component';
    }

}