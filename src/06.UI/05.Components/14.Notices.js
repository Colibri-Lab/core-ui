Colibri.UI.Notices = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        super(name, container, '<div />');
        this.AddClass('app-notices-component');

        this._list = new Colibri.UI.List('list', this);
        this._list.shown = true;
        this._group = this._list.AddGroup('group', '');
    }

    /**
     * Добавить сообщение
     * @param {Notice} noticeData сообщение 
     * @returns {Notice}
     */
    Add(noticeData) {

        if(!noticeData.title) {
            return;
        }

        this.shown = true;
        this.BringToFront();

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

    constructor(title, severity = Colibri.UI.Notice.Error, timeout = 3000) {
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