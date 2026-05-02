/**
 * Download generating informer
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof AuditUIKit.UI.Informers
 */
Colibri.UI.Informers.Download = class extends Colibri.UI.FlexBox {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Informers.Download']);
        this.AddClass('colibri-ui-informers-download');

        this._list = this.Children('list');
        this._listGroup = this.Children('list/group');

        this._list.AddHandler('ItemClicked', this.__listItemClicked, false, this);
        


    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('CloseClicked', false, 'When close button is clicked');
    }

    DisposeItem(args) {
        this.Dispatch('Clicked', args);
        args.item.Dispose();
        if(this._listGroup.children === 0) {
            this.Hide();
        }
    }

    __listItemClicked(event, args) {
        if(args.item.value.percent === 100) {
            this.DisposeItem(args);
        } else {
            App.Confirm.Show(
                'Закрыть информационный блок', 
                'Вы уверены, что хотите закрыть информационный блок? Генерация файла будет продолжена, и он появится вновь.', 
                'Закрыть', 
                'Отменить'
            ).then(() => {
                this.Dispatch('CloseClicked', args).then(() => {
                    this.DisposeItem(args);
                });
            }).catch(() => {});
        }
    }

    Add(informer) {
        this._listGroup.AddItem(informer);
        this.Show();
        this.BringToFront();
    }


}