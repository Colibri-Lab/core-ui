Colibri.UI.AlertDialog = class extends Colibri.UI.Window {

    constructor(name, container, width) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.AlertDialog'], '', width);
        this.AddClass('app-alert-dialog-component')

        this._callback = null;

        


    }

    /**
     * Показывает диалог
     * @param {Function(dialogResult)} callback
     */
    Show(title, message, button) {
        return new Promise((resolve, reject) => {
            this.title = title;
            this.Children('message').value = message;
            this.Children('btn-cancel').value = button || 'Закрыть';
    
            super.Show();

            this.Children('btn-cancel').ClearHandlers();
            this.Children('btn-cancel').AddHandler('Clicked', (event, args) => {
                resolve(this._form.value);
                this.Hide();
            });
        });
    }

}