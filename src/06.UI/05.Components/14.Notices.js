Colibri.UI.Notices = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        super(name, container, '<div />');
        this.AddClass('app-notices-component');

        this._list = new Colibri.UI.List('list', this);
        this._list.shown = true;
        this._group = this._list.AddGroup('group', '');
    }

    Add(noticeData) {

        if(!noticeData.title) {
            return;
        }

        this.shown = true;
        this.BringToFront();

        const className = 'app-notice-' + noticeData.severity + '-component';

        const notice = this._group.AddItem(noticeData);
        
        const removeNotice = () => {
            notice.RemoveClass(className);
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

            notice.AddClass(className);

            const icon = new Colibri.UI.Icon('icon', notice);
            icon.shown = true;
            icon.value = Colibri.UI.CloseIcon;
            icon.AddClass('app-notice-icon-component');
            icon.AddHandler('Clicked', removeNotice);
            notice.AddHandler('Clicked', removeNotice);

            Colibri.Common.Delay(noticeData.timeout || 3000).then(removeNotice);
            
        });
        return notice;
    }

}
