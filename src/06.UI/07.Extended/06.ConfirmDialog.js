/**
 * @class
 * @extends Colibri.UI.Window
 * @memberof Colibri.UI
 */
Colibri.UI.ConfirmDialog = class extends Colibri.UI.Window {

    constructor(name, container, width) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.ConfirmDialog'], '', width);
        this.AddClass('app-confirm-dialog-component')

        this._callback = null;

        


    }

    /**
     * Показывает диалог
     * @param {Function(dialogResult)} callback результат диалога, true - да, false - нет 
     */
    Show(title, message, okbutton = null, cancelbutton = null) {
    
        return new Promise((resolve, reject) => {
            this.title = title;
            this.Children('message').value = message;
            this.Children('btn-save').value = okbutton || '#{ui-confirm-ok}';
            this.Children('btn-cancel').value = cancelbutton || '#{ui-confirm-cancel}';
            super.Show();

            this.Children('btn-save').ClearHandlers();
            this.Children('btn-save').AddHandler('Clicked', (event, args) => {
                resolve();
                this.Hide();
            });
    
            this.Children('btn-cancel').ClearHandlers();
            this.Children('btn-cancel').AddHandler('Clicked', (event, args) => {
                reject();
                this.Hide();
            });

        });

    }

}