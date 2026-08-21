/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * App.Notices.Add(new Colibri.UI.Notice('Notice title', Colibri.UI.Notice.Error, 5000));
 * App.Notices.Add(new Colibri.UI.Notice('Notice title', Colibri.UI.Notice.Success, 5000));
 * ```
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
     * @public
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

        return notice; 

        
        
    }

}
